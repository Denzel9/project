import {
  TASK_STATUS_ENUM,
  type TaskStatus,
} from '@/entities';
import { ROUTES } from '@/shared';
import {
  areSearchParamsEqual,
  isEmptyFilterValue,
  isFlagSearchParam,
  setFlagSearchParam,
  setSearchParam,
} from '@/shared/lib/url-filters';

import { FAST_BUTTON_OPTIONS } from './utils';

import type {
  DashboardPeriod,
  FastButtonFilter,
  FastButtonValueType,
  TaskExtraFilter,
  TaskStatusFilter,
} from './utils';

export type TaskListUrlFilters = {
  postId: string;
  executorId: string;
  status: TaskStatusFilter;
  extraFilter: TaskExtraFilter | null;
  fastButtonValue: FastButtonFilter;
  activeOnly: boolean;
  onlyMyTasks: boolean;
  assigneeAccountId: string;
  updatedDate: string | null;
  searchQuery: string;
  period: DashboardPeriod;
};

const TASK_STATUSES = Object.values(TASK_STATUS_ENUM) as TaskStatus[];
const FAST_VALUES = new Set<string>(FAST_BUTTON_OPTIONS);
const PERIODS = new Set<DashboardPeriod>(['all', 'today', 'week', 'month']);

const TASK_FILTER_KEYS = [
  'postId',
  'executorId',
  'status',
  'active',
  'urgent',
  'overdue',
  'fast',
  'date',
  'q',
  'mine',
  'assignee',
  'period',
  'scroll',
] as const;

const parseId = (value: string | null) =>
  isEmptyFilterValue(value) ? 'all' : value!;

const parseStatus = (value: string | null): TaskStatusFilter => {
  if (!value) return [];

  return value
    .split(',')
    .map(item => item.trim())
    .filter((item): item is TaskStatus =>
      TASK_STATUSES.includes(item as TaskStatus),
    );
};

const parseFast = (value: string | null): FastButtonFilter =>
  value && FAST_VALUES.has(value) ? (value as FastButtonValueType) : null;

const parsePeriod = (value: string | null): DashboardPeriod =>
  value && PERIODS.has(value as DashboardPeriod)
    ? (value as DashboardPeriod)
    : 'all';

export const parseTaskScrollParam = (
  searchParams: URLSearchParams,
): TaskStatus | null => {
  const value = searchParams.get('scroll');

  return value && TASK_STATUSES.includes(value as TaskStatus)
    ? (value as TaskStatus)
    : null;
};

export const parseTaskFiltersSearchParams = (
  searchParams: URLSearchParams,
): TaskListUrlFilters => {
  const extraFilter: TaskExtraFilter | null = isFlagSearchParam(
    searchParams.get('urgent'),
  )
    ? 'urgent'
    : isFlagSearchParam(searchParams.get('overdue'))
      ? 'overdue'
      : null;

  return {
    postId: parseId(searchParams.get('postId')),
    executorId: parseId(searchParams.get('executorId')),
    status: parseStatus(searchParams.get('status')),
    extraFilter,
    fastButtonValue: parseFast(searchParams.get('fast')),
    activeOnly: isFlagSearchParam(searchParams.get('active')),
    onlyMyTasks: isFlagSearchParam(searchParams.get('mine')),
    assigneeAccountId: parseId(searchParams.get('assignee')),
    updatedDate: searchParams.get('date'),
    searchQuery: searchParams.get('q') ?? '',
    period: parsePeriod(searchParams.get('period')),
  };
};

export const writeTaskFiltersSearchParams = (
  current: URLSearchParams,
  filters: TaskListUrlFilters,
  options?: { includePeriod?: boolean },
) => {
  const next = new URLSearchParams(current);

  for (const key of TASK_FILTER_KEYS) {
    if (key === 'period' && !options?.includePeriod) {
      next.delete(key);
      continue;
    }

    if (key === 'scroll') {
      next.delete(key);
      continue;
    }

    next.delete(key);
  }

  setSearchParam(next, 'postId', filters.postId);
  setSearchParam(next, 'executorId', filters.executorId);
  setSearchParam(
    next,
    'status',
    filters.status.length ? filters.status.join(',') : null,
  );
  setFlagSearchParam(next, 'active', filters.activeOnly);
  setFlagSearchParam(next, 'urgent', filters.extraFilter === 'urgent');
  setFlagSearchParam(next, 'overdue', filters.extraFilter === 'overdue');
  setSearchParam(next, 'fast', filters.fastButtonValue);
  setSearchParam(next, 'date', filters.updatedDate);
  setSearchParam(next, 'q', filters.searchQuery.trim() || null);
  setFlagSearchParam(next, 'mine', filters.onlyMyTasks);
  setSearchParam(next, 'assignee', filters.assigneeAccountId);

  if (options?.includePeriod) {
    setSearchParam(next, 'period', filters.period);
  }

  return next;
};

export const taskFiltersSearchParamsEqual = (
  current: URLSearchParams,
  next: URLSearchParams,
) => areSearchParamsEqual(current, next);

export const buildMyTasksHref = (
  filters: TaskListUrlFilters,
  extra?: { scroll?: TaskStatus | null },
) => {
  const params = writeTaskFiltersSearchParams(
    new URLSearchParams(),
    filters,
    { includePeriod: false },
  );

  if (extra?.scroll) {
    params.set('scroll', extra.scroll);
  }

  const query = params.toString();

  return query ? `${ROUTES.MY_TASKS}?${query}` : ROUTES.MY_TASKS;
};
