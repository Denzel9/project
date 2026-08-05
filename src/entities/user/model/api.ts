import { useMutation, useQuery } from '@tanstack/react-query'

import { mainAxios, queryClient } from '@/shared/api'

import type { SearchUsersParams, User, UserSearchList } from './types'

export const userKeys = {
  all: ['user'] as const,
  detail: (id: string | null) => [...userKeys.all, id] as const,
  search: (params: SearchUsersParams) =>
    [...userKeys.all, 'search', params] as const,
}

export const useGetUserByIdQuery = (id: string | null) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => await mainAxios.get<User>(`users/${id}`),
    refetchOnMount: true,
    enabled: Boolean(id),
  })

export const useSearchUsersQuery = (
  params: SearchUsersParams,
  options?: { enabled?: boolean },
) => {
  const q = params.q.trim()
  const canSearch = q.length >= 2

  return useQuery({
    queryKey: userKeys.search({ ...params, q }),
    queryFn: async () => {
      const { data } = await mainAxios.get<UserSearchList>('users/search', {
        params: {
          q,
          page: params.page ?? 1,
          limit: params.limit ?? 20,
        },
      })
      return data
    },
    enabled: (options?.enabled ?? true) && canSearch,
  })
}

export const useUpdateUserMutation = () =>
  useMutation({
    mutationFn: async (data: Partial<User>) =>
      await mainAxios.patch<User>('users/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
