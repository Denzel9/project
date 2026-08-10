import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'

export const pushKeys = {
  all: ['push'] as const,
  status: () => [...pushKeys.all, 'status'] as const,
  vapid: () => [...pushKeys.all, 'vapid'] as const,
}

type VapidResponse = {
  publicKey: string | null
  enabled: boolean
}

type PushStatusResponse = {
  subscribed: boolean
}

export const fetchVapidPublicKey = async () => {
  const { data } = await mainAxios.get<VapidResponse>('/push/vapid-public-key')
  return data
}

export const fetchPushStatus = async () => {
  const { data } = await mainAxios.get<PushStatusResponse>('/push/status')
  return data
}

export const subscribePush = async (subscription: PushSubscriptionJSON) => {
  await mainAxios.post('/push/subscribe', {
    endpoint: subscription.endpoint,
    keys: subscription.keys,
    userAgent: navigator.userAgent,
  })
}

export const unsubscribePush = async (endpoint: string) => {
  await mainAxios.delete('/push/subscribe', { data: { endpoint } })
}

export const usePushVapidQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: pushKeys.vapid(),
    queryFn: fetchVapidPublicKey,
    staleTime: Infinity,
    enabled: options?.enabled ?? true,
  })

export const usePushStatusQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: pushKeys.status(),
    queryFn: fetchPushStatus,
    enabled: options?.enabled ?? true,
  })

export const useSubscribePushMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscribePush,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pushKeys.status() })
    },
  })
}

export const useUnsubscribePushMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: unsubscribePush,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: pushKeys.status() })
    },
  })
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)))
}

export async function enableWebPush(publicKey: string): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push не поддерживается в этом браузере')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Разрешение на уведомления не выдано')
  }

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }))

  await subscribePush(subscription.toJSON())
}

export async function disableWebPush(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    return
  }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    return
  }

  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  await unsubscribePush(endpoint)
}
