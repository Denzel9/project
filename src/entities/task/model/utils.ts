import { isPast, startOfDay } from 'date-fns'

import {
  TaskActivityType,
  TASK_ACTIVITY_LABELS,
  TASK_STATUS_ENUM,
  type Task,
  type TaskActivity,
  type TaskActivityPayload,
  type TaskMedia,
  type TaskStatus,
  type TaskCommentMedia,
  type TaskWithCommentsItem,
  type TaskWithCommentsRawItem,
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

export const isTaskTerminal = (task: Task) =>
  task.status === TASK_STATUS_ENUM.COMPLETED ||
  task.status === TASK_STATUS_ENUM.CANCELLED ||
  task.status === TASK_STATUS_ENUM.CANCELLED_EXECUTOR

export const isTaskOverdue = (task: Task) =>
  Boolean(task.finalDate) &&
  isPast(startOfDay(new Date(task.finalDate!))) &&
  !isTaskTerminal(task)

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

export type ActivityMediaPayload = {
  url: string
  mimeType?: string
  key?: string
  id?: string
}

const normalizeActivityMediaObject = (
  value: Record<string, unknown>,
): ActivityMediaPayload | null => {
  if (typeof value.url !== 'string' || !value.url.trim()) return null

  return {
    url: value.url,
    mimeType:
      typeof value.mimeType === 'string' ? value.mimeType : undefined,
    key: typeof value.key === 'string' ? value.key : undefined,
    id:
      typeof value.mediaId === 'string'
        ? value.mediaId
        : typeof value.id === 'string'
          ? value.id
          : undefined,
  }
}

export const parseActivityMediaPayload = (
  value?: string | Record<string, unknown> | null,
): ActivityMediaPayload | null => {
  if (!value) return null

  if (typeof value === 'object') {
    return normalizeActivityMediaObject(value)
  }

  if (!value.trim()) return null

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>

    if (typeof parsed === 'object' && parsed !== null) {
      return normalizeActivityMediaObject(parsed)
    }
  } catch {
    // plain URL or filename
  }

  if (/^https?:\/\//i.test(value)) {
    return { url: value }
  }

  return null
}

export const getActivityMediaFromPayload = (
  type: TaskActivityType.MEDIA_ADDED | TaskActivityType.MEDIA_REMOVED,
  payload: TaskActivityPayload,
): ActivityMediaPayload | null => {
  if (payload.url) {
    return normalizeActivityMediaObject(
      payload as unknown as Record<string, unknown>,
    )
  }

  const rawValue =
    type === TaskActivityType.MEDIA_ADDED
      ? payload.to ?? payload.from
      : payload.from ?? payload.to

  return parseActivityMediaPayload(rawValue ?? null)
}

const formatMediaActivityPayload = (
  type: TaskActivityType.MEDIA_ADDED | TaskActivityType.MEDIA_REMOVED,
  payload: TaskActivityPayload,
) => {
  const media = getActivityMediaFromPayload(type, payload)

  if (!media) return '—'

  if (media.key) {
    const segments = media.key.split('/').filter(Boolean)
    return segments[segments.length - 1] ?? media.key
  }

  try {
    const url = new URL(media.url)
    const segments = url.pathname.split('/').filter(Boolean)

    return segments[segments.length - 1] ?? media.url
  } catch {
    return media.url
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
    return `${from} → ${to}`
  }

  if ([TaskActivityType.MEDIA_ADDED, TaskActivityType.MEDIA_REMOVED].includes(activity.type)) {
    return
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
    const fileName = formatMediaActivityPayload(
      activity.type,
      activity.payload,
    )

    return {
      title: TASK_ACTIVITY_LABELS[activity.type],
      from: '—',
      to: fileName,
      showDiff: false,
      variant: 'media',
    }
  }

  if (activity.type === TaskActivityType.MEDIA_REMOVED) {
    const fileName = formatMediaActivityPayload(
      activity.type,
      activity.payload,
    )

    return {
      title: TASK_ACTIVITY_LABELS[activity.type],
      from: fileName,
      to: '—',
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

const COMMENT_EDIT_WINDOW_MS = 3 * 60 * 1000
const COMMENT_DELETE_WINDOW_MS = 5 * 60 * 1000

export const canEditComment = (createdAt: string) =>
  Date.now() - new Date(createdAt).getTime() < COMMENT_EDIT_WINDOW_MS

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

export const getCommentsTailPage = (commentsCount: number, limit = 10) =>
  Math.max(1, Math.ceil(commentsCount / limit))

export const normalizeTaskWithCommentsItem = (
  raw: TaskWithCommentsRawItem,
): TaskWithCommentsItem => {
  const embedded = raw.task
  const id =
    raw.id ??
    raw.taskId ??
    embedded?.id ??
    raw.lastComment?.taskId ??
    ''

  return {
    id,
    title: raw.title ?? embedded?.title ?? null,
    ownerId: raw.ownerId ?? embedded?.ownerId ?? '',
    executorId: raw.executorId ?? embedded?.executorId ?? null,
    postId: raw.postId ?? embedded?.postId,
    status: raw.status ?? embedded?.status,
    isExecutorApprove: raw.isExecutorApprove ?? embedded?.isExecutorApprove,
    post: raw.post ?? embedded?.post,
    lastComment: raw.lastComment,
    commentsCount: raw.commentsCount,
    unreadCount: raw.unreadCount,
  }
}
