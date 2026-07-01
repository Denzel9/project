import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useMemo } from 'react'

import { mainAxios } from '@/shared/api'
import { fetchAllPages } from '@/shared/lib/pagination/fetchAllPages'

import { isFavoriteUserItem } from './types'

import type {
  AddFavoriteDto,
  CreateFavoriteGroupDto,
  FavoriteGroup,
  FavoriteList,
  FavoriteListItem,
  FavoriteListParams,
  FavoritePostItem,
  FavoriteUserItem,
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
  allPostIds: () => [...favoriteKeys.all, 'allPostIds'] as const,
  allUserIds: () => [...favoriteKeys.all, 'allUserIds'] as const,
}

const getFavoriteListNextPageParam = (lastPage: FavoriteList) =>
  lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined

const fetchFavoriteUserIds = async () => {
  const [creators, companies] = await Promise.all([
    fetchAllPages<FavoriteListItem>(async (page, limit) => {
      const { data } = await mainAxios.get<FavoriteList>('/favorites', {
        params: { type: 'CREATOR', page, limit },
      })

      return data
    }),
    fetchAllPages<FavoriteListItem>(async (page, limit) => {
      const { data } = await mainAxios.get<FavoriteList>('/favorites', {
        params: { type: 'COMPANY', page, limit },
      })

      return data
    }),
  ])

  const userIds = new Set<string>()

  ;[...creators, ...companies].forEach(item => {
    if (isFavoriteUserItem(item)) {
      userIds.add(item.userId)
    }
  })

  return userIds
}

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
          ...(params.type && { type: params.type }),
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
          ...(params.type && { type: params.type }),
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
  const { data } = useFavoritesQuery({ type: 'POST', page: 1, limit: 100 })

  const favoritePostIds = useMemo(
    () =>
      new Set(
        data?.items
          ?.map(item => ('postId' in item ? item.postId : null))
          .filter((id): id is string => Boolean(id)) ?? [],
      ),
    [data],
  )

  return { favoritePostIds }
}

export const useFavoritePostIdsForPosts = (postIds: string[]) => {
  const { data: allFavoritePostIds, isLoading, isFetching } = useQuery({
    queryKey: favoriteKeys.allPostIds(),
    queryFn: async () => {
      const items = await fetchAllPages<FavoriteListItem>(async (page, limit) => {
        const { data } = await mainAxios.get<FavoriteList>('/favorites', {
          params: { type: 'POST', page, limit },
        })

        return data
      })

      return new Set(
        items
          .map(item => ('postId' in item ? item.postId : null))
          .filter((id): id is string => Boolean(id)),
      )
    },
    staleTime: 5 * 60 * 1000,
  })

  const favoritePostIds = useMemo(() => {
    const result = new Set<string>()

    if (!allFavoritePostIds) return result

    postIds.forEach(postId => {
      if (allFavoritePostIds.has(postId)) {
        result.add(postId)
      }
    })

    return result
  }, [allFavoritePostIds, postIds])

  return {
    favoritePostIds,
    isLoading,
    isFetching,
  }
}

export const useFavoriteUserIds = () => {
  const { data, isLoading, isFetching } = useQuery({
    queryKey: favoriteKeys.allUserIds(),
    queryFn: fetchFavoriteUserIds,
    staleTime: 5 * 60 * 1000,
  })

  return {
    favoriteUserIds: data ?? new Set<string>(),
    isLoading,
    isFetching,
  }
}

export const useAddFavoriteMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (dto: AddFavoriteDto) => {
      const { data } = await mainAxios.post<FavoritePostItem | FavoriteUserItem>(
        '/favorites',
        dto,
      )
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

export const useRemoveFavoriteUserMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      await mainAxios.delete(`/favorites/users/${userId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.all })
    },
  })
}
