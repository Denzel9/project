import { ROUTES } from '@/shared/config/routes'

import { NOTIFICATION_TYPE } from './types'

import type {
  Notification,
  NotificationActor,
  NotificationPayload,
  NotificationType,
} from './types'

export const isNotificationUnread = (notification: Notification) =>
  !notification.readAt

export const getNotificationActorName = (
  actor: NotificationActor | null | undefined,
) => {
  if (!actor) return ''

  if (actor.role === 'COMPANY') {
    return actor.companyName ?? ''
  }

  return [actor.name, actor.lastName].filter(Boolean).join(' ')
}

const getPeerId = (payload: NotificationPayload, actor?: NotificationActor | null) =>
  payload.peerId ?? payload.senderId ?? actor?.id

const getTaskLink = (payload: NotificationPayload) => {
  const taskId = payload.taskId
  const postId = payload.postId

  if (taskId && postId) {
    return `${ROUTES.TASK}/${postId}?taskId=${taskId}&inviteId=${taskId}`
  }

  if (taskId) {
    return `${ROUTES.TASK}/${taskId}?taskId=${taskId}&inviteId=${taskId}`
  }

  if (postId) {
    return `${ROUTES.TASK}/${postId}`
  }

  return null
}

export const getNotificationLink = (
  notification: Pick<Notification, 'type' | 'payload' | 'actor'>,
): string | null => {
  const { type, payload, actor } = notification

  switch (type) {
    case NOTIFICATION_TYPE.APPLICATION_NEW:
    case NOTIFICATION_TYPE.APPLICATION_STATUS_CHANGED:
    case NOTIFICATION_TYPE.APPLICATION_WITHDRAWN:
      if (payload.postId) {
        return `${ROUTES.POST}/${payload.postId}`
      }
      return ROUTES.MANAGE_POSTS

    case NOTIFICATION_TYPE.TASK_CREATED:
    case NOTIFICATION_TYPE.TASK_STATUS_CHANGED:
    case NOTIFICATION_TYPE.TASK_EXECUTOR_ASSIGNED:
    case NOTIFICATION_TYPE.TASK_COMMENT_CREATED:
    case NOTIFICATION_TYPE.TASK_MEDIA_ADDED:
      return getTaskLink(payload)

    case NOTIFICATION_TYPE.CHAT_MESSAGE: {
      const peerId = getPeerId(payload, actor)
      return peerId ? `${ROUTES.CHAT}?recipientId=${peerId}` : ROUTES.CHAT
    }

    case NOTIFICATION_TYPE.TEAM_INVITE: {
      const token = payload.inviteToken ?? payload.token
      if (typeof token === 'string' && token) {
        return `${ROUTES.INVITE}?token=${token}`
      }
      return ROUTES.SETTINGS_MEMBERS
    }

    case NOTIFICATION_TYPE.MEMBERSHIP_REVOKED:
      return ROUTES.SETTINGS_MEMBERS

    case NOTIFICATION_TYPE.PUBLICATION_CREATED:
      return ROUTES.PUBLICATIONS

    default:
      return null
  }
}

export const getNotificationTypeLabel = (type: NotificationType) => {
  switch (type) {
    case NOTIFICATION_TYPE.APPLICATION_NEW:
      return 'Новый отклик'
    case NOTIFICATION_TYPE.APPLICATION_STATUS_CHANGED:
      return 'Статус отклика'
    case NOTIFICATION_TYPE.APPLICATION_WITHDRAWN:
      return 'Отзыв отклика'
    case NOTIFICATION_TYPE.TASK_CREATED:
      return 'Новая задача'
    case NOTIFICATION_TYPE.TASK_STATUS_CHANGED:
      return 'Статус задачи'
    case NOTIFICATION_TYPE.TASK_EXECUTOR_ASSIGNED:
      return 'Назначение исполнителя'
    case NOTIFICATION_TYPE.TASK_COMMENT_CREATED:
      return 'Комментарий к задаче'
    case NOTIFICATION_TYPE.TASK_MEDIA_ADDED:
      return 'Отчёт по задаче'
    case NOTIFICATION_TYPE.CHAT_MESSAGE:
      return 'Сообщение в чате'
    case NOTIFICATION_TYPE.TEAM_INVITE:
      return 'Приглашение в команду'
    case NOTIFICATION_TYPE.MEMBERSHIP_REVOKED:
      return 'Отзыв доступа'
    case NOTIFICATION_TYPE.PUBLICATION_CREATED:
      return 'Новая публикация'
    default:
      return 'Уведомление'
  }
}
