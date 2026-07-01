import { isValid } from 'date-fns';

import {
  TASK_STATUS_LABELS,
  getUserName,
  type Task,
  type User,
} from '@/entities';

import type { TaskSortField, TaskSortOrder } from './types';

export const getTaskTitle = (task: Task) =>
  task.post?.title ?? task.title ?? 'Без названия';

export const getTaskCustomerName = (task: Task) =>
  (task.owner?.companyProfile?.companyName ??
    getUserName(task.owner as Partial<User>)) ||
  [task.executor?.name, task.executor?.lastName].filter(Boolean).join(' ');

const compareStrings = (left: string, right: string) =>
  left.localeCompare(right, 'ru', { sensitivity: 'base' });

const compareDates = (
  left?: string | null,
  right?: string | null,
  order: TaskSortOrder = 'asc',
) => {
  const leftTime =
    left && isValid(new Date(left)) ? new Date(left).getTime() : null;
  const rightTime =
    right && isValid(new Date(right)) ? new Date(right).getTime() : null;

  if (leftTime === null && rightTime === null) return 0;
  if (leftTime === null) return 1;
  if (rightTime === null) return -1;

  return order === 'asc' ? leftTime - rightTime : rightTime - leftTime;
};

export const sortTasks = (
  tasks: Task[],
  sortField: TaskSortField,
  sortOrder: TaskSortOrder,
) => {
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...tasks].sort((left, right) => {
    switch (sortField) {
      case 'title':
        return (
          compareStrings(getTaskTitle(left), getTaskTitle(right)) * direction
        );

      case 'status':
        return (
          compareStrings(
            TASK_STATUS_LABELS[left.status],
            TASK_STATUS_LABELS[right.status],
          ) * direction
        );

      case 'customer':
        return (
          compareStrings(
            getTaskCustomerName(left),
            getTaskCustomerName(right),
          ) * direction
        );

      case 'updatedAt':
        return compareDates(left.updatedAt, right.updatedAt, sortOrder);

      case 'finalDate':
        return compareDates(left.finalDate, right.finalDate, sortOrder);

      default:
        return 0;
    }
  });
};
