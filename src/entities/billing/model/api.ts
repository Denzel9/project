import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore, type PrimeStatus } from '@/features/auth'
import { mainAxios } from '@/shared/api'

export type SubscriptionResponse = {
  status: PrimeStatus
  isPrime: boolean
  expiresAt: string | null
  startedAt: string | null
}

export const billingKeys = {
  all: ['billing'] as const,
  subscription: () => [...billingKeys.all, 'subscription'] as const,
}

const applySubscriptionToAuth = (data: SubscriptionResponse) => {
  const auth = useAuthStore.getState()

  if (!auth.id || !auth.role || !auth.membershipRole) return

  auth.setAuth({
    id: auth.id,
    role: auth.role,
    membershipRole: auth.membershipRole,
    isPrime: data.isPrime,
    primeStatus: data.status,
    primeExpiresAt: data.expiresAt,
    isEmailConfirmed: auth.isEmailConfirmed,
  })
}

export const useSubscriptionQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: billingKeys.subscription(),
    queryFn: async () => {
      const { data } = await mainAxios.get<SubscriptionResponse>(
        '/billing/subscription',
      )
      return data
    },
    enabled: options?.enabled ?? true,
  })

export const useActivateSubscriptionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body?: { days?: number }) => {
      const { data } = await mainAxios.post<SubscriptionResponse>(
        '/billing/subscription/activate',
        body ?? {},
      )
      return data
    },
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.all })
      applySubscriptionToAuth(data)
    },
  })
}

export const useDeactivateSubscriptionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await mainAxios.post<SubscriptionResponse>(
        '/billing/subscription/deactivate',
      )
      return data
    },
    onSuccess: data => {
      void queryClient.invalidateQueries({ queryKey: billingKeys.all })
      applySubscriptionToAuth(data)
    },
  })
}
