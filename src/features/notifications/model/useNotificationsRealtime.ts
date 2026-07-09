import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  notificationKeys,
  prependNotificationToCache,
  setUnreadCountInCache,
  useNotificationsUnreadCountQuery,
} from '@/entities/notification'
import { useAuthStore } from '@/features/auth'
import notificationsSocket from '@/shared/api/notificationsSocket'
import { useSnackbarStore } from '@/widgets'

export const useNotificationsRealtime = () => {
  const queryClient = useQueryClient()
  const isAuth = useAuthStore(state => state.isAuth)
  const { setSnackbarOpen } = useSnackbarStore()

  useNotificationsUnreadCountQuery({ enabled: isAuth })

  useEffect(() => {
    if (!isAuth) {
      notificationsSocket.removeListeners()
      notificationsSocket.disconnect()
      return
    }

    notificationsSocket.onNotification(event => {
      prependNotificationToCache(queryClient, event.notification)
      setUnreadCountInCache(queryClient, event.unreadCount)
      setSnackbarOpen(true, event.notification.title)
    })

    notificationsSocket.onError(() => {
      void queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      })
    })

    notificationsSocket.connect()

    return () => {
      notificationsSocket.removeListeners()
      notificationsSocket.disconnect()
    }
  }, [isAuth, queryClient, setSnackbarOpen])
}
