import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'

import type {
  IntegrationLinkResponse,
  IntegrationsStatusResponse,
  MessengerProvider,
} from './types'

export const integrationsKeys = {
  all: ['integrations'] as const,
  status: () => [...integrationsKeys.all, 'status'] as const,
}

export const fetchIntegrationsStatus = async () => {
  const { data } = await mainAxios.get<IntegrationsStatusResponse>(
    '/integrations',
  )

  return data
}

export const useIntegrationsStatusQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: integrationsKeys.status(),
    queryFn: fetchIntegrationsStatus,
    enabled: options?.enabled ?? true,
  })

export const useCreateIntegrationLinkMutation = () => {
  return useMutation({
    mutationFn: async (provider: MessengerProvider) => {
      const { data } = await mainAxios.post<IntegrationLinkResponse>(
        `/integrations/${provider.toLowerCase()}/link`,
      )

      return data
    },
  })
}

export const useUnlinkIntegrationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (provider: MessengerProvider) => {
      await mainAxios.delete(`/integrations/${provider.toLowerCase()}`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: integrationsKeys.status(),
      })
    },
  })
}
