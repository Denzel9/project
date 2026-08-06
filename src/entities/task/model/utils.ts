import { isPast, startOfDay } from 'date-fns'

import {
  formatBloggerRequirements,
  formatCooperationDetails,
  formatPostBrief,
  formatPostDeliverables,
  formatPostLocation,
  type PostBrief,
  type PostDeliverable,
  type PostLocation,
  type BloggerRequirements,
  type CooperationDetails,
  type UploadMediaResponse,
} from '@/entities/post'
import { getActionActorParts } from '@/shared/lib/formatActionActorLabel'

import {
  TaskActivityType,
  TASK_ACTIVITY_LABELS,
  TASK_STATUS_ENUM,
  type CreateTaskDto,
  type Task,
  type TaskActivity,
  type TaskActivityPayload,
  type TaskMedia,
  type TaskStatus,
  type TaskComment,
  type TaskCommentMedia,
  type TaskWithCommentsItem,
  type TaskWithCommentsRawItem,
} from './types'

import type { Photo } from '@/entities/photo'

export const mapTaskMediaToPhotos = (media: TaskMedia[]): Photo[] =>
  media.map(item => ({
    id: item.id,
    url: item.url,
    key: item.key,
    size: item.size,
    mimeType: item.mimeType,
  }))

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  COMPLETED: 'Завершена',
  PREPARING: 'Подготовка',
  CHECKING: 'На проверке',
  IN_PROGRESS: 'В работе',
  REVISION: 'На доработке',
  PENDING_APPROVAL: 'На согласовании',
  ANNULLED: 'Аннулирована',
}

export const TASK_ROLE_LABELS = {
  owner: 'Заказчик',
  executor: 'Исполнитель',
} as const

export const isTaskTerminal = (task: Task) =>
  task.status === TASK_STATUS_ENUM.COMPLETED ||
  task.status === TASK_STATUS_ENUM.ANNULLED

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
  deliverables: 'Материалы',
  location: 'Локация',
  bloggerRequirements: 'Требования к блогеру',
  cooperationDetails: 'Условия сотрудничества',
  brief: 'Бриф',
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
    case TaskActivityType.ANNULMENT_REQUESTED:
    case TaskActivityType.DEADLINE_EXTENSION_REQUESTED:
      return { label: TASK_ACTIVITY_LABELS[type], color: 'warning' }
    case TaskActivityType.ANNULMENT_CONFIRMED:
    case TaskActivityType.DEADLINE_EXTENSION_CONFIRMED:
      return { label: TASK_ACTIVITY_LABELS[type], color: 'success' }
    case TaskActivityType.ANNULMENT_REJECTED:
    case TaskActivityType.DEADLINE_EXTENSION_REJECTED:
      return { label: TASK_ACTIVITY_LABELS[type], color: 'error' }
    default:
      return { label: 'Изменение', color: 'default' }
  }
}

export const getTaskActivityActorParts = (
  actorId: string,
  context: { ownerId: string; executorId?: string | null },
  actor?: {
    actorDisplayName?: string | null
    actorKind?: 'OWNER' | 'MANAGER' | null
  } | null,
): { kindLabel: string; name: string } => {
  if (actor?.actorDisplayName?.trim() || actor?.actorKind) {
    const parts = getActionActorParts({
      actorDisplayName: actor.actorDisplayName,
      actorKind: actor.actorKind,
    })
    if (parts) return parts
  }

  if (actorId === context.ownerId) {
    return { kindLabel: '', name: TASK_ROLE_LABELS.owner }
  }
  if (context.executorId && actorId === context.executorId) {
    return { kindLabel: '', name: TASK_ROLE_LABELS.executor }
  }

  return { kindLabel: '', name: 'Участник' }
}

export const getTaskActivityActorLabel = (
  actorId: string,
  context: { ownerId: string; executorId?: string | null },
  actor?: {
    actorDisplayName?: string | null
    actorKind?: 'OWNER' | 'MANAGER' | null
  } | null,
) => {
  const parts = getTaskActivityActorParts(actorId, context, actor)
  if (parts.kindLabel && parts.name) {
    return `${parts.kindLabel} · ${parts.name}`
  }
  return parts.name || parts.kindLabel
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

  return parseActivityMediaPayload(
    (rawValue as string | Record<string, unknown> | null | undefined) ?? null,
  )
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

const formatObjectFallback = (value: unknown): string => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const formatActivityValue = (
  field: string | undefined,
  value: unknown,
): string => {
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

  if (field === 'deliverables') {
    const items = Array.isArray(value)
      ? (value as PostDeliverable[])
      : typeof value === 'string'
        ? (() => {
          try {
            return JSON.parse(value) as PostDeliverable[]
          } catch {
            return null
          }
        })()
        : null

    if (items) {
      return formatPostDeliverables(items)
    }
  }

  if (field === 'location' && typeof value === 'object') {
    return formatPostLocation(value as PostLocation)
  }

  if (field === 'bloggerRequirements' && typeof value === 'object') {
    const lines = formatBloggerRequirements(value as BloggerRequirements)
    return lines.length ? lines.join('; ') : '—'
  }

  if (field === 'cooperationDetails' && typeof value === 'object') {
    const lines = formatCooperationDetails(value as CooperationDetails)
    return lines.length ? lines.join('; ') : '—'
  }

  if (field === 'brief' && typeof value === 'object') {
    const items = formatPostBrief(value as PostBrief)
    return items.length
      ? items.map(item => `${item.label}: ${item.value}`).join('; ')
      : '—'
  }

  if (typeof value === 'object') {
    return formatObjectFallback(value)
  }

  return String(value)
}

export type TaskActivityDetailVariant = 'status' | 'field' | 'media' | 'request'

export type TaskActivityDetail = {
  title: string
  fieldLabel?: string
  field?: string
  from: string
  to: string
  showDiff: boolean
  variant: TaskActivityDetailVariant
  reason?: string
  proposedFinalDate?: string
}

const REQUEST_ACTIVITY_TYPES = new Set<TaskActivityType>([
  TaskActivityType.ANNULMENT_REQUESTED,
  TaskActivityType.ANNULMENT_CONFIRMED,
  TaskActivityType.ANNULMENT_REJECTED,
  TaskActivityType.DEADLINE_EXTENSION_REQUESTED,
  TaskActivityType.DEADLINE_EXTENSION_CONFIRMED,
  TaskActivityType.DEADLINE_EXTENSION_REJECTED,
])

export const getTaskActivitySummary = (activity: TaskActivity) => {
  if (activity.type === TaskActivityType.STATUS_CHANGED) {
    const from = formatActivityValue('status', activity.payload.from)
    const to = formatActivityValue('status', activity.payload.to)
    return `${from} → ${to}`
  }

  if ([TaskActivityType.MEDIA_ADDED, TaskActivityType.MEDIA_REMOVED].includes(activity.type)) {
    return
  }

  if (REQUEST_ACTIVITY_TYPES.has(activity.type)) {
    const reason =
      typeof activity.payload.reason === 'string'
        ? activity.payload.reason.trim()
        : ''
    if (reason) return truncateSummary(reason)

    if (
      typeof activity.payload.proposedFinalDate === 'string' &&
      activity.payload.proposedFinalDate
    ) {
      return `До ${formatActivityValue('finalDate', activity.payload.proposedFinalDate)}`
    }

    return TASK_ACTIVITY_LABELS[activity.type]
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

  if (REQUEST_ACTIVITY_TYPES.has(activity.type)) {
    const reason =
      typeof activity.payload.reason === 'string' ? activity.payload.reason : ''
    const proposedFinalDate =
      typeof activity.payload.proposedFinalDate === 'string'
        ? formatActivityValue('finalDate', activity.payload.proposedFinalDate)
        : undefined

    return {
      title: TASK_ACTIVITY_LABELS[activity.type],
      from: reason || '—',
      to: proposedFinalDate ?? '—',
      showDiff: false,
      variant: 'request',
      reason: reason || undefined,
      proposedFinalDate,
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
    from: formatActivityValue(undefined, activity.payload.from),
    to: formatActivityValue(undefined, activity.payload.to),
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

export const isTaskAwaitingUserAction = (
  task: Task,
  userId: string | null,
) => {
  if (!userId || isTaskTerminal(task)) return false

  if (isTaskOwner(task, userId) && task.isCompanyAction && task.isExecutorApprove) return true

  if (isTaskExecutor(task, userId) && !task.isCompanyAction && task.isExecutorApprove) return true

  return false
}

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

type TaskStatusTransitionOptions = {
  /** Подмена «последнего актора» со страницы задачи (activities). */
  lastStatusActorId?: string | null
}

const canActOnTurnBasedStatus = (
  task: Task,
  userId: string | null,
  options?: TaskStatusTransitionOptions,
) => {
  if (options?.lastStatusActorId !== undefined) {
    return Boolean(userId) && options.lastStatusActorId !== userId
  }

  return isTaskAwaitingUserAction(task, userId)
}

/**
 * Разрешённые переходы статуса — те же правила, что на странице задачи (Action.tsx).
 * Для PENDING_APPROVAL / REVISION без activities используется isTaskAwaitingUserAction.
 */
export const getAllowedTaskStatusTransitions = (
  task: Pick<
    Task,
    | 'status'
    | 'ownerId'
    | 'executorId'
    | 'isExecutorApprove'
    | 'isCompanyAction'
  >,
  userId: string | null,
  options?: TaskStatusTransitionOptions,
): TaskStatus[] => {
  if (!userId || !canEditTaskStatus(task as Task, userId)) return []
  if (!task.executorId || task.isExecutorApprove !== true) return []

  const isOwner = isTaskOwner(task as Task, userId)
  const isExecutor = isTaskExecutor(task, userId)
  const canAct = canActOnTurnBasedStatus(task as Task, userId, options)
  const allowed: TaskStatus[] = []

  switch (task.status) {
    case TASK_STATUS_ENUM.PREPARING:
      if (isOwner) allowed.push(TASK_STATUS_ENUM.PENDING_APPROVAL)
      break

    case TASK_STATUS_ENUM.PENDING_APPROVAL:
      if (canAct) allowed.push(TASK_STATUS_ENUM.IN_PROGRESS)
      // «На доработку» — обе стороны
      allowed.push(TASK_STATUS_ENUM.REVISION)
      break

    case TASK_STATUS_ENUM.REVISION:
      if (canAct) {
        if (isOwner) allowed.push(TASK_STATUS_ENUM.PENDING_APPROVAL)
        if (isExecutor) allowed.push(TASK_STATUS_ENUM.IN_PROGRESS)
      }
      break

    case TASK_STATUS_ENUM.IN_PROGRESS:
      if (isExecutor) allowed.push(TASK_STATUS_ENUM.CHECKING)
      break

    case TASK_STATUS_ENUM.CHECKING:
      if (isOwner) {
        allowed.push(TASK_STATUS_ENUM.COMPLETED)
        allowed.push(TASK_STATUS_ENUM.REVISION)
      }
      break

    default:
      break
  }

  return allowed
}

export const canTransitionTaskStatus = (
  task: Pick<
    Task,
    | 'status'
    | 'ownerId'
    | 'executorId'
    | 'isExecutorApprove'
    | 'isCompanyAction'
  >,
  userId: string | null,
  toStatus: TaskStatus,
  options?: TaskStatusTransitionOptions,
) => getAllowedTaskStatusTransitions(task, userId, options).includes(toStatus)

type TaskStatusTransitionFields = Pick<
  Task,
  | 'status'
  | 'ownerId'
  | 'executorId'
  | 'isExecutorApprove'
  | 'isCompanyAction'
>

/**
 * Почему нельзя менять статус / перейти в конкретный статус.
 * `null` — переход разрешён (или есть хотя бы один, если `toStatus` не передан).
 */
export const getTaskStatusTransitionBlockReason = (
  task: TaskStatusTransitionFields,
  userId: string | null,
  toStatus?: TaskStatus,
  options?: TaskStatusTransitionOptions,
): string | null => {
  if (toStatus !== undefined) {
    if (canTransitionTaskStatus(task, userId, toStatus, options)) return null
  } else if (
    getAllowedTaskStatusTransitions(task, userId, options).length > 0
  ) {
    return null
  }

  if (!userId) {
    return 'Войдите в аккаунт, чтобы менять статус'
  }

  if (!canEditTaskStatus(task as Task, userId)) {
    return 'Смена статуса доступна только заказчику или исполнителю'
  }

  if (task.status === TASK_STATUS_ENUM.COMPLETED) {
    return 'Задача уже завершена'
  }

  if (task.status === TASK_STATUS_ENUM.ANNULLED) {
    return 'Задача аннулирована'
  }

  if (!task.executorId) {
    return 'Назначьте исполнителя'
  }

  if (task.isExecutorApprove === null) {
    return 'Ожидается подтверждение исполнителя'
  }

  if (task.isExecutorApprove === false) {
    return 'Исполнитель отклонил задачу'
  }

  const isOwner = isTaskOwner(task as Task, userId)
  const isExecutor = isTaskExecutor(task, userId)
  const canAct = canActOnTurnBasedStatus(task as Task, userId, options)

  if (toStatus !== undefined) {
    switch (task.status) {
      case TASK_STATUS_ENUM.PREPARING:
        if (
          toStatus === TASK_STATUS_ENUM.PENDING_APPROVAL &&
          !isOwner
        ) {
          return 'На согласование может отправить только заказчик'
        }
        break

      case TASK_STATUS_ENUM.PENDING_APPROVAL:
        if (
          toStatus === TASK_STATUS_ENUM.IN_PROGRESS &&
          !canAct
        ) {
          return 'Сейчас ход другой стороны'
        }
        break

      case TASK_STATUS_ENUM.REVISION:
        if (!canAct) {
          return 'Сейчас ход другой стороны'
        }
        if (
          toStatus === TASK_STATUS_ENUM.PENDING_APPROVAL &&
          !isOwner
        ) {
          return 'На согласование может отправить только заказчик'
        }
        if (
          toStatus === TASK_STATUS_ENUM.IN_PROGRESS &&
          !isExecutor
        ) {
          return 'В работу может взять только исполнитель'
        }
        break

      case TASK_STATUS_ENUM.IN_PROGRESS:
        if (
          toStatus === TASK_STATUS_ENUM.CHECKING &&
          !isExecutor
        ) {
          return 'На проверку может отправить только исполнитель'
        }
        if (toStatus === TASK_STATUS_ENUM.REVISION) {
          return 'Из «В работе» нельзя отправить на доработку'
        }
        break

      case TASK_STATUS_ENUM.CHECKING:
        if (!isOwner) {
          return 'Завершить или отправить на доработку может только заказчик'
        }
        break

      default:
        break
    }

    return 'Нельзя перевести задачу в этот статус'
  }

  switch (task.status) {
    case TASK_STATUS_ENUM.PREPARING:
      if (!isOwner) {
        return 'На согласование может отправить только заказчик'
      }
      break

    case TASK_STATUS_ENUM.REVISION:
      if (!canAct) {
        return 'Сейчас ход другой стороны'
      }
      break

    case TASK_STATUS_ENUM.IN_PROGRESS:
      if (!isExecutor) {
        return 'На проверку может отправить только исполнитель'
      }
      break

    case TASK_STATUS_ENUM.CHECKING:
      if (!isOwner) {
        return 'Завершить или отправить на доработку может только заказчик'
      }
      break

    default:
      break
  }

  return 'Нет доступных переходов статуса'
}

export const COMMENT_MODIFY_WINDOW_MS = 60_000

export const canManageComment = (
  commentAuthorId: string,
  userId: string | null,
) => Boolean(userId && commentAuthorId === userId)

export const isCommentWithinModifyWindow = (
  createdAt: string,
  now = Date.now(),
) => now - new Date(createdAt).getTime() < COMMENT_MODIFY_WINDOW_MS

export const canEditTaskComment = (
  comment: Pick<TaskComment, 'authorId' | 'createdAt'>,
  context: { userId: string | null; isOwner: boolean },
  now = Date.now(),
) => {
  if (!context.userId) return false
  if (!isCommentWithinModifyWindow(comment.createdAt, now)) return false
  if (context.isOwner) return true
  return comment.authorId === context.userId
}

export const canDeleteTaskComment = canEditTaskComment

export const getUnreadDividerCommentId = (
  comments: Pick<TaskComment, 'id' | 'authorId' | 'isRead'>[],
  currentUserId: string,
  unreadCount: number,
): string | null => {
  if (unreadCount <= 0) return null

  const incoming = comments.filter(
    comment => comment.authorId !== currentUserId,
  )

  if (!incoming.length) return null

  const firstExplicitUnread = incoming.find(comment => !comment.isRead)

  if (firstExplicitUnread) {
    return firstExplicitUnread.id
  }

  const startIndex = Math.max(0, incoming.length - unreadCount)

  return incoming[startIndex]?.id ?? null
}

export const normalizeTaskComment = (
  comment: TaskComment | (Partial<TaskComment> & Pick<TaskComment, 'id' | 'taskId' | 'authorId' | 'createdAt' | 'updatedAt'>),
): TaskComment => ({
  id: comment.id,
  taskId: comment.taskId,
  authorId: comment.authorId,
  content: comment.content ?? '',
  media: comment.media ?? [],
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  editedAt: comment.editedAt ?? null,
  isRead: comment.isRead ?? false,
  actorAccountId: comment.actorAccountId ?? null,
  actorDisplayName: comment.actorDisplayName ?? null,
  actorKind: comment.actorKind ?? null,
})

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
  isActive?: boolean,
): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case TASK_STATUS_ENUM.COMPLETED:
      return 'success'
    case TASK_STATUS_ENUM.ANNULLED:
      return 'error'
    case TASK_STATUS_ENUM.REVISION:
      return 'warning'
    case TASK_STATUS_ENUM.IN_PROGRESS:
    case TASK_STATUS_ENUM.CHECKING:
      return 'info'
    default:
      return isActive ? 'secondary' : 'primary'
  }
}

export const getCommentsTailPage = (commentsCount: number, limit = 10) =>
  Math.max(1, Math.ceil(commentsCount / limit))

export const normalizeTaskWithCommentsItem = (
  raw: TaskWithCommentsRawItem,
): TaskWithCommentsItem => {
  const embedded = raw.task
  const id = raw.id ?? raw.taskId ?? embedded?.id ?? ''

  const lastCommentPreview =
    typeof raw.lastComment?.preview === 'string'
      ? raw.lastComment.preview
      : (raw.lastComment?.content ?? '')

  const recipient =
    raw.recipient &&
      typeof raw.recipient.id === 'string' &&
      typeof raw.recipient.displayName === 'string'
      ? {
        id: raw.recipient.id,
        displayName: raw.recipient.displayName,
        avatar: raw.recipient.avatar ?? null,
      }
      : null

  return {
    id,
    title: raw.title ?? embedded?.title ?? null,
    ownerId: raw.ownerId ?? embedded?.ownerId,
    executorId: raw.executorId ?? embedded?.executorId ?? null,
    postId: raw.postId ?? embedded?.postId,
    status: raw.status ?? embedded?.status,
    isExecutorApprove: raw.isExecutorApprove ?? embedded?.isExecutorApprove,
    post: raw.post ?? embedded?.post,
    recipient,
    lastComment: {
      preview: lastCommentPreview,
      createdAt: raw.lastComment?.createdAt ?? '',
      authorId: raw.lastComment?.authorId ?? '',
    },
    commentsCount: raw.commentsCount,
    unreadCount: raw.unreadCount ?? 0,
  }
}

export const buildCreateTaskPayload = (
  task: Task,
  postId: string,
  executorId?: string | null,
): CreateTaskDto => ({
  postId,
  ...(executorId ? { executorId } : {}),
  description: task.description,
  photoCount: task.photoCount,
  videoCount: task.videoCount,
  deliverables: task.deliverables,
  cooperationDetails: task.cooperationDetails,
  bloggerRequirements: task.bloggerRequirements,
  brief: task.brief,
  // Без id/kind: CreateTaskDto на бэке принимает только url/key/size/mimeType
  // (forbidNonWhitelisted). Ключи старой задачи бэкенд скопирует в новую.
  media: (task.media ?? []).map(({ url, key, size, mimeType }) => ({
    url,
    key,
    size,
    mimeType,
  })),
  urgent: task.urgent,
  title: task.title,
})
