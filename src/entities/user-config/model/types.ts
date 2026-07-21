import type { NotificationType } from '@/entities/notification'

export type UserConfig = {
  id: string
  userId: string
  inAppNotificationTypes: NotificationType[]
  emailNotificationTypes: NotificationType[]
  createdAt: string
  updatedAt: string
}

export type UpdateUserConfigDto = {
  inAppNotificationTypes?: NotificationType[]
  emailNotificationTypes?: NotificationType[]
}
