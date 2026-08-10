import { type ReactNode } from 'react'

import { useChatUnreadRealtime } from '@/features/chat'
import { useNotificationsRealtime } from '@/features/notifications'

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  useNotificationsRealtime()
  useChatUnreadRealtime()

  return children
}
