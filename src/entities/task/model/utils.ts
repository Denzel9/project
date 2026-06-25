import {
  TaskActivityType,
  TASK_ACTIVITY_LABELS,
  TASK_STATUS_ENUM,
  type Task,
  type TaskActivity,
  type TaskMedia,
  type TaskStatus,
  type TaskCommentMedia,
} from './types'

import type { Photo } from '@/entities/photo'
import type { UploadMediaResponse } from '@/entities/post'

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
  CANCELLED_EXECUTOR: 'Отменена исполнителем',
}

export const TASK_ROLE_LABELS = {
  owner: 'Заказчик',
  executor: 'Исполнитель',
} as const

const TASK_FIELD_LABELS: Record<string, string> = {
  title: 'Заголовок',
  description: 'Описание',
  finalDate: 'Дедлайн',
  photoCount: 'Кол-во фото',
  videoCount: 'Кол-во видео',
  urgent: 'Срочность',
  status: 'Статус',
}

export const getTaskFieldLabel = (field?: string) =>
  field ? (TASK_FIELD_LABELS[field] ?? field) : undefined

type ActivityChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'

export const getTaskActivityMeta = (
  type: TaskActivityType,
): { label: string; color: ActivityChipColor } => {
  switch (type) {
    case TaskActivityType.STATUS_CHANGED:
      return { label: TASK_ACTIVITY_LABELS[type], color: 'primary' }
    case TaskActivityType.FIELD_UPDATED:
      return { label: TASK_ACTIVITY_LABELS[type], color: 'info' }
    case TaskActivityType.MEDIA_ADDED:
      return { label: TASK_ACTIVITY_LABELS[type], color: 'success' }
    case TaskActivityType.MEDIA_REMOVED:
      return { label: TASK_ACTIVITY_LABELS[type], color: 'error' }
    default:
      return { label: 'Изменение', color: 'default' }
  }
}

export const getTaskActivityActorLabel = (
  actorId: string,
  context: { ownerId: string; executorId?: string | null },
) => {
  if (actorId === context.ownerId) return TASK_ROLE_LABELS.owner
  if (context.executorId && actorId === context.executorId) {
    return TASK_ROLE_LABELS.executor
  }

  return 'Участник'
}

const truncateSummary = (text: string, maxLength = 80) => {
  if (text.length <= maxLength) return text

  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  return `${lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated}…`
}

const formatMediaActivityValue = (value?: string) => {
  if (!value?.trim()) return '—'

  try {
    const url = new URL(value)
    const segments = url.pathname.split('/').filter(Boolean)

    return segments[segments.length - 1] ?? value
  } catch {
    return value
  }
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

export type TaskActivityDetailVariant = 'status' | 'field' | 'media'

export type TaskActivityDetail = {
  title: string
  fieldLabel?: string
  field?: string
  from: string
  to: string
  showDiff: boolean
  variant: TaskActivityDetailVariant
}

export const getTaskActivitySummary = (activity: TaskActivity) => {
  if (activity.type === TaskActivityType.STATUS_CHANGED) {
    const from = formatActivityValue('status', activity.payload.from)
    const to = formatActivityValue('status', activity.payload.to)
    return `Статус: ${from} → ${to}`
  }

  if (activity.type === TaskActivityType.MEDIA_ADDED) {
    const fileName = formatMediaActivityValue(
      activity.payload.to || activity.payload.from,
    )
    return fileName !== '—'
      ? `Загружено: ${fileName}`
      : TASK_ACTIVITY_LABELS[activity.type]
  }

  if (activity.type === TaskActivityType.MEDIA_REMOVED) {
    const fileName = formatMediaActivityValue(
      activity.payload.from || activity.payload.to,
    )
    return fileName !== '—'
      ? `Удалено: ${fileName}`
      : TASK_ACTIVITY_LABELS[activity.type]
  }

  if (activity.type === TaskActivityType.FIELD_UPDATED && activity.payload.field) {
    const label = getTaskFieldLabel(activity.payload.field)
    const from = formatActivityValue(activity.payload.field, activity.payload.from)
    const to = formatActivityValue(activity.payload.field, activity.payload.to)
    return `${label}: ${truncateSummary(from)} → ${truncateSummary(to)}`
  }

  return 'Изменение задачи'
}

export const getTaskActivityDetail = (
  activity: TaskActivity,
): TaskActivityDetail => {
  if (activity.type === TaskActivityType.STATUS_CHANGED) {
    return {
      title: TASK_ACTIVITY_LABELS[activity.type],
      fieldLabel: 'Статус',
      field: 'status',
      from: formatActivityValue('status', activity.payload.from),
      to: formatActivityValue('status', activity.payload.to),
      showDiff: false,
      variant: 'status',
    }
  }

  if (activity.type === TaskActivityType.MEDIA_ADDED) {
    return {
      title: TASK_ACTIVITY_LABELS[activity.type],
      from: formatMediaActivityValue(activity.payload.from),
      to: formatMediaActivityValue(activity.payload.to),
      showDiff: false,
      variant: 'media',
    }
  }

  if (activity.type === TaskActivityType.MEDIA_REMOVED) {
    return {
      title: TASK_ACTIVITY_LABELS[activity.type],
      from: formatMediaActivityValue(activity.payload.from),
      to: formatMediaActivityValue(activity.payload.to),
      showDiff: false,
      variant: 'media',
    }
  }

  if (activity.type === TaskActivityType.FIELD_UPDATED && activity.payload.field) {
    const field = activity.payload.field
    const fieldLabel = getTaskFieldLabel(field)

    return {
      title: fieldLabel
        ? `Изменено: ${fieldLabel}`
        : TASK_ACTIVITY_LABELS[activity.type],
      fieldLabel,
      field,
      from: formatActivityValue(field, activity.payload.from),
      to: formatActivityValue(field, activity.payload.to),
      showDiff: true,
      variant: 'field',
    }
  }

  return {
    title: 'Изменение задачи',
    from: activity.payload.from ?? '',
    to: activity.payload.to ?? '',
    showDiff: false,
    variant: 'field',
  }
}

export const formatTaskActivityText = (activity: TaskActivity) =>
  getTaskActivitySummary(activity)

export const isTaskOwner = (task: Task, userId: string | null) =>
  Boolean(userId && task.ownerId === userId)

export const isTaskExecutor = (
  task: Pick<Task, 'executorId'>,
  userId: string | null,
) => Boolean(userId && task.executorId === userId)

export const canEditTaskFields = (task: Task, userId: string | null) =>
  isTaskOwner(task, userId)

export const canEditTaskStatus = (task: Task, userId: string | null) =>
  isTaskOwner(task, userId) || isTaskExecutor(task, userId)

export const getIsCompanyAction = (
  task: Task,
  isOwner: boolean,
  newStatus?: TaskStatus,
) => {
  if (newStatus === TASK_STATUS_ENUM.IN_PROGRESS) {
    return false
  }

  if (newStatus === TASK_STATUS_ENUM.REVISION) {
    return !isOwner
  }

  if (newStatus === TASK_STATUS_ENUM.COMPLETED) {
    return true
  }

  return !task.isCompanyAction
}

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

export const getTaskStatusColor = (
  status: TaskStatus,
): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case TASK_STATUS_ENUM.COMPLETED:
      return 'success'
    case TASK_STATUS_ENUM.CANCELLED:
    case TASK_STATUS_ENUM.CANCELLED_EXECUTOR:
      return 'error'
    case TASK_STATUS_ENUM.REVISION:
      return 'warning'
    case TASK_STATUS_ENUM.IN_PROGRESS:
    case TASK_STATUS_ENUM.CHECKING:
      return 'info'
    default:
      return 'primary'
  }
}
