import { useMemo } from 'react';

import {
  useTasksCalendarQuery,
  type TaskCalendarDateField,
  type TaskCalendarItem,
  type TaskCalendarParams,
} from '@/entities';

import type { CalendarEventTypeFilter } from './types';

const EVENT_TYPE_TO_DATE_FIELD: Record<
  Exclude<CalendarEventTypeFilter, 'all'>,
  TaskCalendarDateField
> = {
  created: 'createdAt',
  deadline: 'finalDate',
};

type UseCalendarTasksParams = {
  dateFrom: string;
  dateTo: string;
  eventType: CalendarEventTypeFilter;
  urgentOnly: boolean;
  companyId: 'all' | string;
  isCompany: boolean;
  onlyMyTasks?: boolean;
  assigneeAccountId?: string;
  postId?: string;
  executorId?: string;
};

const mergeCalendarTasks = (lists: Array<TaskCalendarItem[] | undefined>) => {
  const map = new Map<string, TaskCalendarItem>();

  lists.forEach(items => {
    items?.forEach(task => {
      map.set(task.id, task);
    });
  });

  return [...map.values()];
};

export const useCalendarTasks = ({
  dateFrom,
  dateTo,
  eventType,
  urgentOnly,
  companyId,
  isCompany,
  onlyMyTasks = false,
  assigneeAccountId = 'all',
  postId = 'all',
  executorId = 'all',
}: UseCalendarTasksParams) => {
  const baseParams = useMemo<Omit<TaskCalendarParams, 'page' | 'limit'>>(
    () => ({
      dateFrom,
      dateTo,
      ...(urgentOnly ? { urgent: true } : {}),
      ...(companyId !== 'all' && isCompany ? { executorId: companyId } : {}),
      ...(companyId !== 'all' && !isCompany ? { ownerId: companyId } : {}),
      ...(onlyMyTasks ? { assigneeMine: true } : {}),
      ...(assigneeAccountId !== 'all' && !onlyMyTasks
        ? { assigneeAccountId }
        : {}),
      ...(postId !== 'all' ? { postId } : {}),
      ...(executorId !== 'all' && isCompany ? { executorId } : {}),
      ...(executorId !== 'all' && !isCompany ? { ownerId: executorId } : {}),
    }),
    [
      assigneeAccountId,
      companyId,
      dateFrom,
      dateTo,
      executorId,
      isCompany,
      onlyMyTasks,
      postId,
      urgentOnly,
    ],
  );

  const createdQuery = useTasksCalendarQuery(
    { ...baseParams, dateField: 'createdAt' },
    { enabled: eventType === 'all' || eventType === 'created' },
  );

  const deadlineQuery = useTasksCalendarQuery(
    { ...baseParams, dateField: 'finalDate' },
    { enabled: eventType === 'all' || eventType === 'deadline' },
  );

  const singleDateField =
    eventType === 'created' || eventType === 'deadline'
      ? EVENT_TYPE_TO_DATE_FIELD[eventType]
      : 'createdAt';

  const singleQuery = useTasksCalendarQuery(
    {
      ...baseParams,
      dateField: singleDateField,
    },
    { enabled: eventType !== 'all' },
  );

  const tasks = useMemo(() => {
    if (eventType === 'all') {
      return mergeCalendarTasks([createdQuery.data, deadlineQuery.data]);
    }

    return singleQuery.data ?? [];
  }, [createdQuery.data, deadlineQuery.data, eventType, singleQuery.data]);

  const isLoading =
    eventType === 'all'
      ? createdQuery.isLoading || deadlineQuery.isLoading
      : singleQuery.isLoading;

  const isError =
    eventType === 'all'
      ? createdQuery.isError || deadlineQuery.isError
      : singleQuery.isError;

  return { tasks, isLoading, isError };
};
