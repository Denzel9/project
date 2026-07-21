import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { mainAxios, queryClient as appQueryClient } from '@/shared/api'

import type { UpdateUserConfigDto, UserConfig } from './types'

export const userConfigKeys = {
  all: ['user-config'] as const,
  config: () => [...userConfigKeys.all, 'config'] as const,
}

export const fetchUserConfig = async () => {
  const { data } = await mainAxios.get<UserConfig>('/config')

  return data
}

export const prefetchUserConfig = async (
  client: QueryClient = appQueryClient,
) =>
  client.fetchQuery({
    queryKey: userConfigKeys.config(),
    queryFn: fetchUserConfig,
    staleTime: Infinity,
  })

export const useUserConfigQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: userConfigKeys.config(),
    queryFn: fetchUserConfig,
    staleTime: Infinity,
    enabled: options?.enabled ?? true,
  })

export const useUpdateUserConfigMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: UpdateUserConfigDto) => {
      const { data } = await mainAxios.patch<UserConfig>('/config', body)

      return data
    },
    onSuccess: data => {
      queryClient.setQueryData(userConfigKeys.config(), data)
    },
  })
}
