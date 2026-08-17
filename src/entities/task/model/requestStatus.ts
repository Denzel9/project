import type {
  Task,
  TaskAnnulment,
  TaskAnnulmentInitiator,
  TaskAnnulmentStatus,
  TaskDeadlineExtension,
  TaskDeadlineExtensionStatus,
} from './types'

export type TaskRequestStatus = TaskAnnulmentStatus | TaskDeadlineExtensionStatus

export const TASK_REQUEST_INITIATOR_LABELS: Record<
  TaskAnnulmentInitiator,
  string
> = {
  CUSTOMER: 'Заказчик',
  EXECUTOR: 'Исполнитель',
  MUTUAL: 'Договорённость сторон',
}

export const TASK_REQUEST_STATUS_COLOR: Record<TaskRequestStatus, string> = {
  PENDING: 'warning.main',
  CONFIRMED: 'success.main',
  REJECTED: 'error.main',
}

export const TASK_DEADLINE_REQUEST_TITLE: Record<TaskRequestStatus, string> = {
  PENDING: 'Запрос на перенос дедлайна ожидает решения',
  CONFIRMED: 'Запрос на перенос дедлайна принят',
  REJECTED: 'Запрос на перенос дедлайна отклонён',
}

export const TASK_ANNULMENT_REQUEST_TITLE: Record<TaskRequestStatus, string> = {
  PENDING: 'Запрос на аннулирование ожидает решения',
  CONFIRMED: 'Запрос на аннулирование принят',
  REJECTED: 'Запрос на аннулирование отклонён',
}

export const getTaskDeadlineRequest = (
  task: Pick<Task, 'deadlineExtension' | 'deadlineExtensions'>,
): TaskDeadlineExtension | null =>
  task.deadlineExtension ?? task.deadlineExtensions?.[0] ?? null

export const getTaskAnnulmentRequest = (
  task: Pick<Task, 'annulment' | 'annulments'>,
): TaskAnnulment | null => task.annulment ?? task.annulments?.[0] ?? null

export const hasTaskRequestStatusIcons = (
  task: Pick<
    Task,
    | 'annulment'
    | 'annulments'
    | 'deadlineExtension'
    | 'deadlineExtensions'
    | 'isExecutorApprove'
  >,
): boolean =>
  Boolean(
    getTaskDeadlineRequest(task) ||
      getTaskAnnulmentRequest(task) ||
      task.isExecutorApprove === false,
  )
