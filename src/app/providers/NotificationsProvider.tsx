import { type ReactNode } from 'react'

import { useNotificationsRealtime } from '@/features/notifications'

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  useNotificationsRealtime()

  return children
}
