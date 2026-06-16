import type { Task, TaskStatus } from './types'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PREPARING: 'Подготовка',
  PENDING_APPROVAL: 'На согласовании',
  IN_PROGRESS: 'В работе',
  REVISION: 'На доработке',
  COMPLETED: 'Завершена',
  CANCELLED: 'Отменена',
}

export const TASK_ROLE_LABELS = {
  owner: 'Заказчик',
  executor: 'Исполнитель',
} as const

export const isTaskOwner = (task: Pick<Task, 'ownerId'>, userId: string | null) =>
  Boolean(userId && task.ownerId === userId)

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
  task: Task,
  userId: string | null,
) => isTaskOwner(task, userId) || Boolean(userId && commentAuthorId === userId)
