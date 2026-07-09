import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'

import { mainAxios } from '@/shared/api'

import { isNotificationUnread } from './utils'

import type {
  Notification,
  NotificationList,
  NotificationListParams,
  NotificationUnreadCount,
} from './types'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: NotificationListParams) =>
    [...notificationKeys.all, 'list', params ?? {}] as const,
  infiniteList: (params?: Omit<NotificationListParams, 'page'>) =>
    [...notificationKeys.all, 'infiniteList', params ?? {}] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
}

const getNotificationListNextPageParam = (lastPage: NotificationList) =>
  lastPage.page * lastPage.limit < lastPage.total
    ? lastPage.page + 1
    : undefined

const upsertNotificationInList = (
  items: Notification[],
  notification: Notification,
) => {
  const existingIndex = items.findIndex(item => item.id === notification.id)

  if (existingIndex === -1) {
    return [notification, ...items]
  }

  const next = [...items]
  next[existingIndex] = notification
  return next
}

const isPlainNotificationListQuery = (query: { queryKey: readonly unknown[] }) =>
  query.queryKey[0] === notificationKeys.all[0] && query.queryKey[1] === 'list'

const isInfiniteNotificationListQuery = (query: {
  queryKey: readonly unknown[]
}) =>
  query.queryKey[0] === notificationKeys.all[0] &&
  query.queryKey[1] === 'infiniteList'

export const prependNotificationToCache = (
  client: QueryClient,
  notification: Notification,
) => {
  client.setQueriesData<NotificationList>(
    { predicate: isPlainNotificationListQuery },
    old => {
      if (!old?.items) return old

      const hadItem = old.items.some(item => item.id === notification.id)

      return {
        ...old,
        items: upsertNotificationInList(old.items, notification),
        total: hadItem ? old.total : old.total + 1,
      }
    },
  )

  client.setQueriesData<InfiniteData<NotificationList>>(
    { predicate: isInfiniteNotificationListQuery },
    old => {
      if (!old?.pages?.length) return old

      const firstPage = old.pages[0]
      const hasNotification = old.pages.some(page =>
        page.items.some(item => item.id === notification.id),
      )

      return {
        ...old,
        pages: [
          {
            ...firstPage,
            items: upsertNotificationInList(firstPage.items, notification),
            total: hasNotification ? firstPage.total : firstPage.total + 1,
          },
          ...old.pages.slice(1),
        ],
      }
    },
  )
}

export const setUnreadCountInCache = (
  client: QueryClient,
  count: number,
) => {
  client.setQueryData<NotificationUnreadCount>(notificationKeys.unreadCount(), {
    count,
  })
}

export const markNotificationReadInCache = (
  client: QueryClient,
  notification: Notification,
) => {
  const readNotification = {
    ...notification,
    readAt: notification.readAt ?? new Date().toISOString(),
  }

  client.setQueriesData<NotificationList>(
    { predicate: isPlainNotificationListQuery },
    old => {
      if (!old?.items) return old

      return {
        ...old,
        items: old.items.map(item =>
          item.id === readNotification.id ? readNotification : item,
        ),
      }
    },
  )

  client.setQueriesData<InfiniteData<NotificationList>>(
    { predicate: isInfiniteNotificationListQuery },
    old => {
      if (!old?.pages?.length) return old

      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          items: page.items.map(item =>
            item.id === readNotification.id ? readNotification : item,
          ),
        })),
      }
    },
  )
}

export const markAllNotificationsReadInCache = (client: QueryClient) => {
  const markItems = (items: Notification[]) =>
    items.map(item =>
      isNotificationUnread(item)
        ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
        : item,
    )

  client.setQueriesData<NotificationList>(
    { predicate: isPlainNotificationListQuery },
    old => {
      if (!old?.items) return old

      return {
        ...old,
        items: markItems(old.items),
      }
    },
  )

  client.setQueriesData<InfiniteData<NotificationList>>(
    { predicate: isInfiniteNotificationListQuery },
    old => {
      if (!old?.pages?.length) return old

      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          items: markItems(page.items),
        })),
      }
    },
  )

  setUnreadCountInCache(client, 0)
}

export const useNotificationsQuery = (params?: NotificationListParams) =>
  useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: async () => {
      const { data } = await mainAxios.get<NotificationList>('/notifications', {
        params,
      })
      return data
    },
  })

export const useNotificationsInfiniteQuery = (
  params?: Omit<NotificationListParams, 'page'>,
  options?: { enabled?: boolean },
) => {
  const limit = params?.limit ?? 20

  return useInfiniteQuery({
    queryKey: notificationKeys.infiniteList(params),
    queryFn: async ({ pageParam }) => {
      const { data } = await mainAxios.get<NotificationList>('/notifications', {
        params: { ...params, page: pageParam, limit },
      })
      return data
    },
    initialPageParam: 1,
    getNextPageParam: getNotificationListNextPageParam,
    enabled: options?.enabled ?? true,
  })
}

export const useNotificationsUnreadCountQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const { data } = await mainAxios.get<NotificationUnreadCount>(
        '/notifications/unread-count',
      )
      return data
    },
    enabled: options?.enabled ?? true,
  })

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await mainAxios.patch<Notification>(
        `/notifications/${id}/read`,
      )
      return data
    },
    onSuccess: notification => {
      markNotificationReadInCache(queryClient, notification)

      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })
    },
  })
}

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data } = await mainAxios.patch<{ updated: number }>(
        '/notifications/read-all',
      )
      return data
    },
    onSuccess: () => {
      markAllNotificationsReadInCache(queryClient)
    },
  })
}
