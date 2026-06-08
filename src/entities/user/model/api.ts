import { useMutation, useQuery } from '@tanstack/react-query'

import { mainAxios, queryClient } from '@/shared/api'

import type { User } from './types'

export const useGetUserByIdQuery = (id: string) =>
  useQuery({
    queryKey: ['user', id],
    queryFn: async () => await mainAxios.get<User>(`users/${id}`),
    refetchOnMount: true,
  })

export const useUpdateUserMutation = () =>
  useMutation({
    mutationFn: async (data: Partial<User>) => await mainAxios.patch<User>('users/update', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })

