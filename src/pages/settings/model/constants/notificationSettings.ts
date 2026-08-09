import { NOTIFICATION_TYPE, type NotificationType } from '@/entities/notification'

export type NotificationSettingsGroup = {
  id: string
  title: string
  types: NotificationType[]
}

export const NOTIFICATION_SETTINGS_GROUPS: NotificationSettingsGroup[] = [
  {
    id: 'applications',
    title: 'Отклики',
    types: [
      NOTIFICATION_TYPE.APPLICATION_NEW,
      NOTIFICATION_TYPE.APPLICATION_STATUS_CHANGED,
      NOTIFICATION_TYPE.APPLICATION_WITHDRAWN,
    ],
  },
  {
    id: 'tasks',
    title: 'Задачи',
    types: [
      NOTIFICATION_TYPE.TASK_CREATED,
      NOTIFICATION_TYPE.TASK_STATUS_CHANGED,
      NOTIFICATION_TYPE.TASK_EXECUTOR_ASSIGNED,
      NOTIFICATION_TYPE.TASK_COMMENT_CREATED,
      NOTIFICATION_TYPE.TASK_MEDIA_ADDED,
      NOTIFICATION_TYPE.TASK_DEADLINE_SOON,
      NOTIFICATION_TYPE.TASK_DEADLINE_TODAY,
      NOTIFICATION_TYPE.TASK_DEADLINE_OVERDUE,
    ],
  },
  {
    id: 'chat',
    title: 'Чат',
    types: [NOTIFICATION_TYPE.CHAT_MESSAGE],
  },
  {
    id: 'publications',
    title: 'Публикации',
    types: [NOTIFICATION_TYPE.PUBLICATION_CREATED],
  },
  {
    id: 'team',
    title: 'Команда',
    types: [
      NOTIFICATION_TYPE.TEAM_INVITE,
      NOTIFICATION_TYPE.MEMBERSHIP_REVOKED,
    ],
  },
]

export const ALL_NOTIFICATION_TYPES = NOTIFICATION_SETTINGS_GROUPS.flatMap(
  group => group.types,
)
