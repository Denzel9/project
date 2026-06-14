import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  groups: () => [...favoriteKeys.all, 'groups'] as const,
  search: (params: SearchFavoritesParams) =>
    [...favoriteKeys.all, 'search', params] as const,
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

export const useFavoriteGroupsQuery = () =>
  useQuery({
    queryKey: favoriteKeys.groups(),
    queryFn: async () => {
      const { data } = await mainAxios.get<FavoriteGroup[]>('/favorites/groups')
      return data
    },
  })

export const useFavoritePostIds = () => {
  const { data } = useFavoritesQuery({ page: 1, limit: 100 })

  return useMemo(
    () => new Set(data?.items?.map(item => item.postId) ?? []),
    [data],
  )
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
