export {
  notificationKeys,
  prependNotificationToCache,
  setUnreadCountInCache,
  markNotificationReadInCache,
  markAllNotificationsReadInCache,
  useNotificationsQuery,
  useNotificationsInfiniteQuery,
  useNotificationsUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from './model/api'

export {
  getNotificationActorName,
  getNotificationLink,
  getNotificationTypeLabel,
  isNotificationUnread,
} from './model/utils'

export { NOTIFICATION_TYPE } from './model/types'

export type {
  Notification,
  NotificationActor,
  NotificationList,
  NotificationListParams,
  NotificationPayload,
  NotificationSocketEvent,
  NotificationType,
  NotificationUnreadCount,
} from './model/types'
