import {
  getChatTaskInvitePreview,
  getChatTaskRequestPreview,
  getChatTaskTzPreview,
  isTaskExecutor,
  TASK_STATUS_ENUM,
  USER_ROLE,
  type ChatMessagePin,
  type Task,
  type TaskListParams,
  type TaskRole,
  type TaskStatus,
} from '@/entities'
import { formatActionActorLabel } from '@/shared'

const ACTIVE_CHAT_TASK_STATUSES: TaskStatus[] = [
  TASK_STATUS_ENUM.PREPARING,
  TASK_STATUS_ENUM.PENDING_APPROVAL,
  TASK_STATUS_ENUM.IN_PROGRESS,
  TASK_STATUS_ENUM.REVISION,
  TASK_STATUS_ENUM.CHECKING,
]

export const isActiveChatTask = (task: Task) =>
  ACTIVE_CHAT_TASK_STATUSES.includes(task.status)

export const canUploadChatPhotoReport = (
  task: Task,
  currentUserId: string | null | undefined,
) =>
  Boolean(
    currentUserId &&
    isTaskExecutor(task, currentUserId) &&
    (task.status === TASK_STATUS_ENUM.IN_PROGRESS ||
      task.status === TASK_STATUS_ENUM.REVISION),
  )

export const getChatTaskLabel = (task: Task) =>
  task.title?.trim() || task.post?.title?.trim() || 'Задача'

export type ChatAddTaskStatusFilter = TaskStatus | 'all'

export type ChatAddTaskFilters = {
  query: string
  status: ChatAddTaskStatusFilter
  date: string
}

export const filterChatAddTaskTasks = (
  tasks: Task[],
  filters: ChatAddTaskFilters,
) => {
  const query = filters.query.trim().toLowerCase()

  return tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false
    }

    if (filters.date) {
      const createdDate = task.createdAt.slice(0, 10)

      if (createdDate !== filters.date) {
        return false
      }
    }

    if (query && !getChatTaskLabel(task).toLowerCase().includes(query)) {
      return false
    }

    return true
  })
}

export const getChatPeerTasksParams = (
  peerId: string | undefined,
  role: string | null | undefined,
): TaskListParams | undefined => {
  if (!peerId) {
    return undefined
  }

  if (role === USER_ROLE.COMPANY) {
    return {
      page: 1,
      limit: 100,
      role: 'owner' satisfies TaskRole,
      executorId: peerId,
    }
  }

  if (role === USER_ROLE.CREATOR) {
    return {
      page: 1,
      limit: 100,
      role: 'executor' satisfies TaskRole,
      ownerId: peerId,
    }
  }

  return undefined
}

export const getPinnedMessagePreview = (pin: ChatMessagePin) => {
  const trimmed = pin.content.trim()

  if (trimmed) {
    const preview =
      getChatTaskTzPreview(trimmed) ??
      getChatTaskInvitePreview(trimmed) ??
      getChatTaskRequestPreview(trimmed) ??
      trimmed
    const max = 90

    return preview.length > max ? `${preview.slice(0, max)}…` : preview
  }

  if (pin.mediaCount > 0) {
    return `Медиа (${pin.mediaCount})`
  }

  return 'Сообщение'
}

export const getPinnedMessageAuthorName = (pin: ChatMessagePin) =>
  formatActionActorLabel(
    {
      actorDisplayName: pin.actorDisplayName,
      actorKind: pin.actorKind,
    },
    pin.senderDisplayName,
  ) ||
  pin.senderDisplayName ||
  'Участник'
