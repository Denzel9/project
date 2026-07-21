export const NOTIFICATION_TYPE = {
  APPLICATION_NEW: 'APPLICATION_NEW',
  APPLICATION_STATUS_CHANGED: 'APPLICATION_STATUS_CHANGED',
  APPLICATION_WITHDRAWN: 'APPLICATION_WITHDRAWN',
  TASK_CREATED: 'TASK_CREATED',
  TASK_STATUS_CHANGED: 'TASK_STATUS_CHANGED',
  TASK_EXECUTOR_ASSIGNED: 'TASK_EXECUTOR_ASSIGNED',
  TASK_COMMENT_CREATED: 'TASK_COMMENT_CREATED',
  TASK_MEDIA_ADDED: 'TASK_MEDIA_ADDED',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  TEAM_INVITE: 'TEAM_INVITE',
  MEMBERSHIP_REVOKED: 'MEMBERSHIP_REVOKED',
  PUBLICATION_CREATED: 'PUBLICATION_CREATED',
} as const

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE]

export type NotificationActor = {
  id: string
  role: 'CREATOR' | 'COMPANY'
  avatar: string | null
  name?: string
  lastName?: string
  companyName?: string
}

export type NotificationPayload = {
  taskId?: string
  postId?: string
  applicationId?: string
  conversationId?: string
  peerId?: string
  senderId?: string
  inviteId?: string
  inviteToken?: string
  workspaceId?: string
  [key: string]: unknown
}

export type Notification = {
  id: string
  type: NotificationType
  title: string
  body: string | null
  payload: NotificationPayload
  readAt: string | null
  createdAt: string
  actor: NotificationActor | null
}

export type NotificationList = {
  items: Notification[]
  total: number
  page: number
  limit: number
}

export type NotificationListParams = {
  read?: boolean
  type?: NotificationType
  page?: number
  limit?: number
}

export type NotificationUnreadCount = {
  count: number
}

export type NotificationSocketEvent = {
  notification: Notification
  unreadCount: number
}
