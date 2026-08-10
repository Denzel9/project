import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { chatKeys } from '@/entities/chat'
import {
  NOTIFICATION_TYPE,
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
  const userId = useAuthStore(state => state.id)
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

      if (event.notification.type === NOTIFICATION_TYPE.CHAT_MESSAGE) {
        void queryClient.invalidateQueries({
          queryKey: chatKeys.unreadCount(),
        })
        void queryClient.invalidateQueries({
          queryKey: chatKeys.conversationsRoot(),
        })
      }
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
  }, [isAuth, userId, queryClient, setSnackbarOpen])
}
