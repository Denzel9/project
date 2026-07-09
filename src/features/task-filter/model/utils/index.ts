import {
  TASK_STATUS_ENUM,
  type TaskListParams,
  type TaskRole,
  type TaskStatsCategory,
  type TaskStatus,
} from '@/entities/task';

import { ALL_TASK_STATUSES } from '../constants';

export type TaskRoleFilter = TaskRole | 'all';
export type TaskStatusFilter = TaskStatus | 'all';

export type FastButtonValueType = TaskStatsCategory;
export type FastButtonFilter = FastButtonValueType | null;

export const FAST_BUTTON_PRIMARY_COUNT = 3;

export const FAST_BUTTON_OPTIONS: FastButtonValueType[] = [
  'pending-action',
  'pending-executor-assign',
  'no-executor-assign',
  'overdue',
  'urgent',
  'checking',
  'cancelled',
];

export const FAST_BUTTON_DASHBOARD_OPTIONS = FAST_BUTTON_OPTIONS.filter(
  value => value !== 'cancelled',
);

export const FAST_BUTTON_TASK_OPTIONS = FAST_BUTTON_OPTIONS.filter(
  value => value !== 'checking',
);

export type DashboardCardVariant =
  (typeof FAST_BUTTON_DASHBOARD_OPTIONS)[number];

export const FAST_BUTTON_LABELS: Record<FastButtonValueType, string> = {
  'pending-action': 'Ожидают действия',
  'pending-executor-assign': 'Ожидают подтверждения',
  'no-executor-assign': 'Не назначены',
  overdue: 'Просроченные',
  urgent: 'Срочные',
  checking: 'На проверке',
  cancelled: 'Отменённые',
};

export const getFastButtonLabel = (value: FastButtonValueType): string =>
  FAST_BUTTON_LABELS[value];

export const getFastButtonOptions = (
  isCompany: boolean,
): FastButtonValueType[] =>
  FAST_BUTTON_TASK_OPTIONS.filter(
    value => isCompany || value !== 'no-executor-assign',
  );

export const getDashboardCardOptions = (
  isCompany: boolean,
): DashboardCardVariant[] =>
  FAST_BUTTON_DASHBOARD_OPTIONS.filter(
    value => isCompany || value !== 'no-executor-assign',
  );

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

const CANCELLED_TASK_STATUSES = 'CANCELLED,CANCELLED_EXECUTOR';

export const getKanbanColumnsForFastButton = (
  fastButtonValue: FastButtonFilter,
): TaskStatus[] => {
  if (!fastButtonValue) return ALL_TASK_STATUSES;

  return fastButtonValue === 'cancelled'
    ? CANCELLED_KANBAN_STATUSES
    : ACTIVE_KANBAN_STATUSES;
};

export type TaskExtraFilter = 'overdue' | 'urgent';

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
  ...(filters.updatedDate && { createdDate: filters.updatedDate }),
});

export const toTaskFilterParams = (
  filters: Parameters<typeof toTasksParams>[0],
): Omit<TaskListParams, 'page' | 'limit'> => {
  const { ...rest } = toTasksParams(filters);

  return rest;
};

const applyFastButtonQueryParams = (
  params: Omit<TaskListParams, 'page' | 'limit'>,
  fastButtonValue: FastButtonValueType,
  isCompany: boolean,
): Omit<TaskListParams, 'page' | 'limit'> => {
  switch (fastButtonValue) {
    case 'pending-action':
      return {
        ...params,
        role: isCompany ? 'owner' : 'executor',
        isCompanyAction: isCompany,
        active: true,
      };
    case 'pending-executor-assign':
      return {
        ...params,
        isExecutorApprove: null,
        active: true,
      };
    case 'no-executor-assign':
      return {
        ...params,
        role: 'owner',
        unassigned: true,
        active: true,
      };
    case 'overdue':
      return { ...params, overdue: true, active: true };
    case 'urgent':
      return { ...params, urgent: true, active: true };
    case 'checking':
      return { ...params, status: TASK_STATUS_ENUM.CHECKING };
    case 'cancelled':
      return { ...params, statuses: CANCELLED_TASK_STATUSES };
    default:
      return params;
  }
};

const applyExtraFilterQueryParams = (
  params: Omit<TaskListParams, 'page' | 'limit'>,
  extraFilter: TaskExtraFilter | null,
): Omit<TaskListParams, 'page' | 'limit'> => {
  if (extraFilter === 'overdue') {
    return { ...params, overdue: true, active: true };
  }

  if (extraFilter === 'urgent') {
    return { ...params, urgent: true, active: true };
  }

  return params;
};

export const toMyTasksQueryParams = (filters: {
  postId: string;
  status: TaskStatusFilter;
  updatedDate: string | null;
  viewMode: 'grid' | 'kanban' | 'table';
  fastButtonValue: FastButtonFilter;
  extraFilter: TaskExtraFilter | null;
  isCompany: boolean;
  page?: number;
  limit?: number;
}): TaskListParams => {
  const base = toTaskFilterParams({
    status: filters.viewMode === 'kanban' ? 'all' : filters.status,
    postId: filters.postId === 'all' ? undefined : filters.postId,
    updatedDate: filters.updatedDate,
  });

  let params = base;

  if (filters.fastButtonValue) {
    params = applyFastButtonQueryParams(
      params,
      filters.fastButtonValue,
      filters.isCompany,
    );
  }

  params = applyExtraFilterQueryParams(params, filters.extraFilter);

  return {
    ...params,
    ...(filters.page !== undefined && { page: filters.page }),
    ...(filters.limit !== undefined && { limit: filters.limit }),
  };
};

export type DashboardTasksQueryFilters = {
  isCompany: boolean;
  status?: TaskStatus;
  taskId?: string;
  personId?: string;
  urgentOnly?: boolean;
};

export const toDashboardTasksQueryParams = (
  filters: DashboardTasksQueryFilters,
  pagination: { page: number; limit: number },
): TaskListParams => ({
  page: pagination.page,
  limit: pagination.limit,
  ...(filters.status && { status: filters.status }),
  ...(filters.urgentOnly && { urgent: true }),
  ...(filters.personId &&
    (filters.isCompany
      ? { executorId: filters.personId }
      : { ownerId: filters.personId })),
});
