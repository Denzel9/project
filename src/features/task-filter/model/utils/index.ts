import dayjs from 'dayjs';

import {
  TASK_STATUS_ENUM,
  type TaskListParams,
  type TaskRole,
  type TaskStatsCategory,
  type TaskStatus,
} from '@/entities/task';
import 'dayjs/locale/ru';

import { ALL_TASK_STATUSES } from '../constants';

dayjs.locale('ru');

export type TaskRoleFilter = TaskRole | 'all';
export type TaskStatusFilter = TaskStatus | 'all';

export type DashboardPeriod = 'all' | 'today' | 'week' | 'month';

export const getDashboardPeriodRange = (
  period: DashboardPeriod,
): { dateFrom?: string; dateTo?: string; dateField?: 'finalDate' } => {
  if (period === 'all') return {};

  const now = dayjs();

  if (period === 'today') {
    const day = now.format('YYYY-MM-DD');

    return { dateFrom: day, dateTo: day, dateField: 'finalDate' };
  }

  if (period === 'week') {
    return {
      dateFrom: now.startOf('week').format('YYYY-MM-DD'),
      dateTo: now.endOf('week').format('YYYY-MM-DD'),
      dateField: 'finalDate',
    };
  }

  return {
    dateFrom: now.startOf('month').format('YYYY-MM-DD'),
    dateTo: now.endOf('month').format('YYYY-MM-DD'),
    dateField: 'finalDate',
  };
};

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

/** Company dashboard catalog (6) */
export const COMPANY_DASHBOARD_CARD_OPTIONS = [
  'pending-action',
  'pending-executor-assign',
  'no-executor-assign',
  'overdue',
  'urgent',
  'checking',
] as const satisfies readonly FastButtonValueType[];

/** Creator dashboard catalog (6) — вместо «Не назначены» → «Отменённые» */
export const CREATOR_DASHBOARD_CARD_OPTIONS = [
  'pending-action',
  'pending-executor-assign',
  'cancelled',
  'overdue',
  'urgent',
  'checking',
] as const satisfies readonly FastButtonValueType[];

export type DashboardCardVariant =
  | (typeof COMPANY_DASHBOARD_CARD_OPTIONS)[number]
  | (typeof CREATOR_DASHBOARD_CARD_OPTIONS)[number];

/** @deprecated use getDashboardCardOptions — kept for shared company-shaped lists */
export const FAST_BUTTON_DASHBOARD_OPTIONS = [
  ...COMPANY_DASHBOARD_CARD_OPTIONS,
] as const;

export const FAST_BUTTON_TASK_OPTIONS = FAST_BUTTON_OPTIONS.filter(
  value => value !== 'checking',
);

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
  isCompany
    ? [...COMPANY_DASHBOARD_CARD_OPTIONS]
    : [...CREATOR_DASHBOARD_CARD_OPTIONS];

export const ACTIVE_KANBAN_STATUSES: TaskStatus[] = [
  TASK_STATUS_ENUM.PREPARING,
  TASK_STATUS_ENUM.PENDING_APPROVAL,
  TASK_STATUS_ENUM.IN_PROGRESS,
  TASK_STATUS_ENUM.REVISION,
  TASK_STATUS_ENUM.CHECKING,
];

const CANCELLED_KANBAN_STATUSES: TaskStatus[] = [
  TASK_STATUS_ENUM.ANNULLED,
];

const CANCELLED_TASK_STATUSES = 'ANNULLED';

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
    executorId?: string;
    updatedDate?: string | null;
  },
  pagination?: { page?: number; limit?: number },
): TaskListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.postId && { postId: filters.postId }),
  ...(filters.executorId && { executorId: filters.executorId }),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
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
        // Не показываем задачи, где исполнитель ещё не подтвердил назначение
        // (отдельная карточка: `pending-executor-assign`).
        isExecutorApprove: true,
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
    return { ...params, overdue: true, active: true, isArchived: false };
  }

  if (extraFilter === 'urgent') {
    return { ...params, urgent: true, active: true, isArchived: false };
  }

  return { ...params, isArchived: false };
};

export const toMyTasksQueryParams = (filters: {
  postId: string;
  executorId: string;
  status: TaskStatusFilter;
  updatedDate: string | null;
  viewMode: 'grid' | 'kanban' | 'table';
  fastButtonValue: FastButtonFilter;
  extraFilter: TaskExtraFilter | null;
  activeOnly?: boolean;
  onlyMyTasks?: boolean;
  assigneeAccountId?: string;
  isCompany: boolean;
  q?: string;
  taskId?: string;
  deadlineDate?: string | null;
  page?: number;
  limit?: number;
}): TaskListParams => {
  const base = {
    ...toTaskFilterParams({
      status: filters.viewMode === 'kanban' ? 'all' : filters.status,
      postId: filters.postId === 'all' ? undefined : filters.postId,
      updatedDate: filters.updatedDate,
    }),
    ...(filters.executorId !== 'all' &&
      (filters.isCompany
        ? { executorId: filters.executorId }
        : { ownerId: filters.executorId })),
    ...(filters.q && { q: filters.q }),
    ...(filters.taskId &&
      filters.taskId !== 'all' && { taskId: filters.taskId }),
    ...(filters.deadlineDate && { deadlineDate: filters.deadlineDate }),
    ...(filters.onlyMyTasks && { assigneeMine: true }),
    ...(filters.assigneeAccountId &&
      filters.assigneeAccountId !== 'all' &&
      !filters.onlyMyTasks && {
      assigneeAccountId: filters.assigneeAccountId,
    }),
  };

  let params = base;

  if (filters.fastButtonValue) {
    params = applyFastButtonQueryParams(
      params,
      filters.fastButtonValue,
      filters.isCompany,
    );
  }

  params = applyExtraFilterQueryParams(params, filters.extraFilter);

  if (filters.activeOnly) {
    params = { ...params, active: true };
  }

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
  updatedDate?: string;
  deadlineDate?: string;
  q?: string;
  personQ?: string;
  onlyMyTasks?: boolean;
  assigneeAccountId?: string;
  postId?: string;
  executorId?: string;
  dateFrom?: string;
  dateTo?: string;
  dateField?: 'createdAt' | 'updatedAt' | 'finalDate';
};

export const toDashboardTasksQueryParams = (
  filters: DashboardTasksQueryFilters,
  pagination: { page: number; limit: number },
): TaskListParams => ({
  page: pagination.page,
  limit: pagination.limit,
  role: filters.isCompany ? 'owner' : 'executor',
  ...(filters.status && { status: filters.status }),
  ...(filters.urgentOnly && { urgent: true }),
  ...(filters.taskId && { taskId: filters.taskId }),
  ...(filters.personId &&
    (filters.isCompany
      ? { executorId: filters.personId }
      : { ownerId: filters.personId })),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
  ...(filters.deadlineDate && { deadlineDate: filters.deadlineDate }),
  ...(filters.q && { q: filters.q }),
  ...(filters.personQ && {
    personQ: filters.personQ,
    personField: filters.isCompany ? 'executor' : 'owner',
  }),
  ...(filters.onlyMyTasks && { assigneeMine: true }),
  ...(filters.assigneeAccountId &&
    filters.assigneeAccountId !== 'all' &&
    !filters.onlyMyTasks && {
    assigneeAccountId: filters.assigneeAccountId,
  }),
  ...(filters.postId &&
    filters.postId !== 'all' && { postId: filters.postId }),
  ...(filters.executorId &&
    filters.executorId !== 'all' &&
    (filters.isCompany
      ? { executorId: filters.executorId }
      : { ownerId: filters.executorId })),
  ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
  ...(filters.dateTo && { dateTo: filters.dateTo }),
  ...(filters.dateField && { dateField: filters.dateField }),
});

export {
  countTasksByPostId,
  pickRepresentativeTasksByPost,
} from './groupTasksByPost';
