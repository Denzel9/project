import {
  TASK_STATUS_ENUM,
  TaskActivityType,
  type Task,
  type TaskActivity,
  type TaskMedia,
  type TaskStatus,
  type UploadMediaResponse,
  type TaskCommentMedia,
} from './types'

import type { Photo } from '@/entities/photo'

export const mapTaskMediaToPhotos = (media: TaskMedia[]): Photo[] =>
  media.map(item => ({
    id: item.id,
    url: item.url,
    key: item.key,
    mimeType: item.mimeType,
    size: item.size,
  }))

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PREPARING: 'Подготовка',
  PENDING_APPROVAL: 'На согласовании',
  IN_PROGRESS: 'В работе',
  REVISION: 'На доработке',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
  CHECKING: 'На проверке',
}

export const TASK_ROLE_LABELS = {
  owner: 'Заказчик',
  executor: 'Исполнитель',
} as const

const TASK_FIELD_LABELS: Record<string, string> = {
  description: 'Описание',
  finalDate: 'Дедлайн',
  photoCount: 'Кол-во фото',
  videoCount: 'Кол-во видео',
  urgent: 'Срочность',
  status: 'Статус',
}

const formatActivityValue = (
  field: string | undefined,
  value: string | boolean | null | undefined,
) => {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  if (field === 'status' && typeof value === 'string') {
    return TASK_STATUS_LABELS[value as TaskStatus] ?? value
  }

  if (field === 'urgent') {
    return value === true || value === 'true' ? 'Да' : 'Нет'
  }

  if (field === 'finalDate' && typeof value === 'string') {
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return String(value)
}

export const formatTaskActivityText = (activity: TaskActivity) => {
  if (activity.type === TaskActivityType.STATUS_CHANGED) {
    const from = formatActivityValue('status', activity.payload.from)
    const to = formatActivityValue('status', activity.payload.to)
    return `Статус изменён: ${from} → ${to}`
  }

  if (activity.type === TaskActivityType.MEDIA_ADDED) {
    return 'Загружено медиа'
  }

  if (activity.type === TaskActivityType.MEDIA_REMOVED) {
    return 'Удалено медиа'
  }

  if (activity.type === TaskActivityType.FIELD_UPDATED && activity.payload.field) {
    const label = TASK_FIELD_LABELS[activity.payload.field] ?? activity.payload.field
    const from = formatActivityValue(activity.payload.field, activity.payload.from)
    const to = formatActivityValue(activity.payload.field, activity.payload.to)
    return `Изменено поле "${label}": с ${from?.slice(0, 20)} на ${to?.slice(0, 20)}`
  }

  return 'Изменение задачи'
}

export const isTaskOwner = (task: Task, userId: string | null) =>
  Boolean(userId && task.ownerId === userId) && [TASK_STATUS_ENUM.PREPARING, TASK_STATUS_ENUM.REVISION].includes(task?.status as TASK_STATUS_ENUM)

export const isTaskExecutor = (
  task: Pick<Task, 'executorId'>,
  userId: string | null,
) => Boolean(userId && task.executorId === userId)

export const canEditTaskFields = (task: Task, userId: string | null) =>
  isTaskOwner(task, userId)

export const canEditTaskStatus = (task: Task, userId: string | null) =>
  isTaskOwner(task, userId) || isTaskExecutor(task, userId)

export const canManageComment = (
  commentAuthorId: string,
  userId: string | null,
) => Boolean(userId && commentAuthorId === userId)

const COMMENT_DELETE_WINDOW_MS = 5 * 60 * 1000

export const canDeleteComment = (createdAt: string) =>
  Date.now() - new Date(createdAt).getTime() < COMMENT_DELETE_WINDOW_MS

export const toTaskCommentMedia = (
  upload: UploadMediaResponse,
): TaskCommentMedia => ({
  url: upload.url,
  key: upload.key,
  mimeType: upload.mimeType,
  size: String(upload.size),
})
