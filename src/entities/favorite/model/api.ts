import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'

import { mainAxios } from '@/shared/api'

import type {
  AddFavoriteDto,
  CreateFavoriteGroupDto,
  Favorite,
  FavoriteGroup,
  FavoriteList,
  FavoriteListParams,
  SearchFavoritesParams,
} from './types'

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: (params?: FavoriteListParams) =>
    [...favoriteKeys.all, 'list', params ?? {}] as const,
  infiniteList: (params?: Omit<FavoriteListParams, 'page'>) =>
    [...favoriteKeys.all, 'infiniteList', params ?? {}] as const,
  groups: () => [...favoriteKeys.all, 'groups'] as const,
  search: (params: SearchFavoritesParams) =>
    [...favoriteKeys.all, 'search', params] as const,
  infiniteSearch: (params: Omit<SearchFavoritesParams, 'page'>) =>
    [...favoriteKeys.all, 'infiniteSearch', params] as const,
  forPosts: (postIds: string[]) =>
    [...favoriteKeys.all, 'forPosts', postIds] as const,
}

const getFavoriteListNextPageParam = (lastPage: FavoriteList) =>
  lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined

export const useFavoritesQuery = (params?: FavoriteListParams) =>
  useQuery({
    queryKey: favoriteKeys.list(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<FavoriteList>('/favorites', {
        params,
      })
      return data
    },
  })

export const useFavoritesInfiniteQuery = (
  params?: Omit<FavoriteListParams, 'page'>,
) => {
  const limit = params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: favoriteKeys.infiniteList(params),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<FavoriteList>('/favorites', {
        params: { ...params, page: pageParam, limit },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: getFavoriteListNextPageParam,
  })
}

export const useSearchFavoritesQuery = (params: SearchFavoritesParams) => {
  const trimmedQuery = params.q.trim()
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  return useQuery({
    queryKey: favoriteKeys.search({ ...params, q: trimmedQuery, page, limit }),
    queryFn: async () => {
      const { data } = await mainAxios.get<FavoriteList>('/favorites', {
        params: {
          q: trimmedQuery,
          page,
          limit,
          ...(params.groupId && { groupId: params.groupId }),
          ...(params.ungrouped && { ungrouped: params.ungrouped }),
        },
      })
      return data
    },
    enabled: trimmedQuery.length >= 2,
  })
}

export const useSearchFavoritesInfiniteQuery = (
  params: Omit<SearchFavoritesParams, 'page'>,
) => {
  const trimmedQuery = params.q.trim()
  const limit = params.limit ?? 20

  return useInfiniteQuery({
    queryKey: favoriteKeys.infiniteSearch({
      ...params,
      q: trimmedQuery,
      limit,
    }),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<FavoriteList>('/favorites', {
        params: {
          q: trimmedQuery,
          page: pageParam,
          limit,
          ...(params.groupId && { groupId: params.groupId }),
          ...(params.ungrouped && { ungrouped: params.ungrouped }),
        },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: getFavoriteListNextPageParam,
    enabled: trimmedQuery.length >= 2,
  })
}

export const useFavoriteGroupsQuery = (enabled: boolean = false) =>
  useQuery({
    queryKey: favoriteKeys.groups(),
    queryFn: async () => {
      const { data } = await mainAxios.get<FavoriteGroup[]>('/favorites/groups')
      return data
    },
    enabled,

  })

export const useFavoritePostIds = () => {
  const { data } = useFavoritesQuery({ page: 1, limit: 100 })

  const favoritePostIds = useMemo(
    () => new Set(data?.items?.map(item => item.postId) ?? []),
    [data],
  )

  return { favoritePostIds }
}

export const useFavoritePostIdsForPosts = (postIds: string[]) => {
  const sortedPostIds = useMemo(
    () => [...postIds].sort(),
    [postIds],
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: favoriteKeys.forPosts(sortedPostIds),
    queryFn: async () => {
      const limit = Math.min(Math.max(sortedPostIds.length, 20), 100)
      const { data } = await mainAxios.get<FavoriteList>('/favorites', {
        params: { page: 1, limit },
      })

      const favoritePostIds = new Set<string>()

      data.items.forEach(item => {
        if (sortedPostIds.includes(item.postId)) {
          favoritePostIds.add(item.postId)
        }
      })

      return favoritePostIds
    },
    enabled: sortedPostIds.length > 0,
    placeholderData: previousData => previousData,
  })

  return {
    favoritePostIds: data ?? new Set<string>(),
    isLoading,
    isFetching,
  }
}

export const useAddFavoriteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: AddFavoriteDto) => {
      const { data } = await mainAxios.post<Favorite>('/favorites', dto)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all })
    },
  })
}

export const useCreateFavoriteGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateFavoriteGroupDto) => {
      const { data } = await mainAxios.post<FavoriteGroup>(
        '/favorites/groups',
        body,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all })
    },
  })
}

export const useDeleteFavoriteGroupMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await mainAxios.delete(`/favorites/groups/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all })
    },
  })
}

export const useRemoveFavoriteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (postId: string) => {
      await mainAxios.delete(`/favorites/${postId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all })
    },
  })
}
