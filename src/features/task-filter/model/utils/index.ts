import {
  isTaskOverdue,
  isTaskTerminal,
  TASK_STATUS_ENUM,
  type Task,
  type TaskListParams,
  type TaskRole,
  type TaskStatus,
} from '@/entities/task';

export type TaskRoleFilter = TaskRole | 'all';
export type TaskStatusFilter = TaskStatus | 'all';
export type FastButtonValueType =
  | 'pending-action'
  | 'pending-executor-assign'
  | 'no-executor-assign'
  | 'cancelled';

export const FAST_BUTTON_FILTER_PARAM = 'fastFilter';

export const FAST_BUTTON_OPTIONS: FastButtonValueType[] = [
  'pending-action',
  'pending-executor-assign',
  'no-executor-assign',
  'cancelled',
];

export const DASHBOARD_FAST_BUTTON_OPTIONS = FAST_BUTTON_OPTIONS.filter(
  value => value !== 'cancelled',
);

export const isFastButtonValue = (
  value: string | null,
): value is FastButtonValueType =>
  FAST_BUTTON_OPTIONS.includes(value as FastButtonValueType);

export const getFastButtonLabel = (
  value: FastButtonValueType,
) => {
  switch (value) {
    case 'pending-action':
      return 'Ожидают действия';
    case 'pending-executor-assign':
      return 'Ожидают подтверждения';
    case 'no-executor-assign':
      return 'Не назначены';
    case 'cancelled':
      return 'Отменённые';
  }
};

export const ACTIVE_KANBAN_STATUSES: TaskStatus[] = [
  TASK_STATUS_ENUM.PREPARING,
  TASK_STATUS_ENUM.PENDING_APPROVAL,
  TASK_STATUS_ENUM.IN_PROGRESS,
  TASK_STATUS_ENUM.REVISION,
  TASK_STATUS_ENUM.CHECKING,
];

const CANCELLED_KANBAN_STATUSES: TaskStatus[] = [
  TASK_STATUS_ENUM.CANCELLED,
  TASK_STATUS_ENUM.CANCELLED_EXECUTOR,
];

const isCancelledStatus = (status: TaskStatus) =>
  CANCELLED_KANBAN_STATUSES.includes(status);

const isPendingCompanyAction = (task: Task) =>
  task.isCompanyAction === true || task.isCompanyAction === undefined;

const isPendingExecutorAction = (task: Task) => task.isCompanyAction === false;

export const getKanbanColumnsForFastButton = (
  fastButtonValue: FastButtonValueType,
): TaskStatus[] =>
  fastButtonValue === 'cancelled'
    ? CANCELLED_KANBAN_STATUSES
    : ACTIVE_KANBAN_STATUSES;

export const filterTasksByExecutorApprove = (
  tasks: Task[],
  filter: FastButtonValueType,
  isCompany: boolean,
): Task[] => {
  switch (filter) {
    case 'pending-action':
      return tasks.filter(task => {
        if (
          !task.executorId ||
          !task.isExecutorApprove ||
          task.status === TASK_STATUS_ENUM.COMPLETED ||
          isCancelledStatus(task.status)
        ) {
          return false;
        }

        return isCompany
          ? isPendingCompanyAction(task)
          : isPendingExecutorAction(task);
      });
    case 'pending-executor-assign':
      return tasks.filter(
        task =>
          Boolean(task.executorId) &&
          task.isExecutorApprove === null &&
          !isCancelledStatus(task.status),
      );
    case 'no-executor-assign':
      return tasks.filter(
        task => !task.executorId && !isCancelledStatus(task.status),
      );
    case 'cancelled':
      return tasks.filter(
        task => isCancelledStatus(task.status),
      );
  }
};

export type TaskExtraFilter = 'overdue' | 'urgent';

export const applyExtraTaskFilter = (
  tasks: Task[],
  extraFilter: TaskExtraFilter | null,
) => {
  if (!extraFilter) return tasks;

  if (extraFilter === 'overdue') {
    return tasks.filter(task => Boolean(task.finalDate) && isTaskOverdue(task));
  }

  return tasks.filter(task => task.urgent && !isTaskTerminal(task));
};

export const getVisibleTasks = (
  tasks: Task[],
  options: {
    viewMode: 'grid' | 'kanban' | 'table';
    status: TaskStatusFilter;
    fastButtonValue: FastButtonValueType;
    isCompany: boolean;
    extraFilter?: TaskExtraFilter | null;
  },
): Task[] => {
  const { viewMode, status, fastButtonValue, isCompany, extraFilter = null } =
    options;

  let visible;

  if (viewMode !== 'kanban' && status !== 'all') {
    visible = tasks;
  } else {
    visible = filterTasksByExecutorApprove(tasks, fastButtonValue, isCompany);
  }

  return applyExtraTaskFilter(visible, extraFilter);
};

export const toTasksParams = (
  filters: {
    status: TaskStatusFilter;
    postId?: string;
    updatedDate?: string | null;
  },
  pagination?: { page?: number; limit?: number },
): TaskListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.postId && { postId: filters.postId }),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
});

export const toTaskFilterParams = (
  filters: Parameters<typeof toTasksParams>[0],
): Omit<TaskListParams, 'page' | 'limit'> => {
  const { ...rest } = toTasksParams(filters);

  return rest;
};
