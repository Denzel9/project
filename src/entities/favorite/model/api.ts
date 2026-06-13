import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { mainAxios } from '@/shared/api'

import type {
  AddFavoriteDto,
  Favorite,
  FavoriteGroup,
  FavoriteList,
  FavoriteListParams,
} from './types'

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: (params?: FavoriteListParams) =>
    [...favoriteKeys.all, 'list', params ?? {}] as const,
  groups: () => [...favoriteKeys.all, 'groups'] as const,
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
