import { startOfDay } from 'date-fns';
import dayjs from 'dayjs';

import {
  isTaskOverdue,
  isTaskTerminal,
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  type Task,
  type TaskActivity,
  type TaskActivityFeedItem,
  type TaskComment,
  type TaskStatus,
  type TaskWithCommentsItem,
} from '@/entities';
import {
  ACTIVE_KANBAN_STATUSES,
  getTaskConfig,
  type KanbanColumnColor,
} from '@/features';
import { hasCommentText } from '@/pages/task/model/lib/commentMedia';
import { ROUTES } from '@/shared';

import {
  DASHBOARD_COMMENTS_READ_AFTER_KEY,
  MAX_DASHBOARD_LIST_ITEMS,
  UPCOMING_DEADLINE_DAYS,
} from './constants';

import type { Theme } from '@mui/material/styles';

export type StatusChartDatum = {
  status: TaskStatus;
  id: TaskStatus;
  label: string;
  value: number;
  color: string;
};

export type DashboardActivityItem = {
  activity: TaskActivity;
  task: Task;
};

export type DashboardCommentItem = {
  comment: TaskComment;
  task: Task;
};

export type DashboardTaskCommentsItem = {
  task: Task;
  lastComment: TaskComment;
  commentsCount: number;
  unreadCount?: number;
};

export const getDashboardCommentsReadAfter = (): string | undefined => {
  try {
    return localStorage.getItem(DASHBOARD_COMMENTS_READ_AFTER_KEY) ?? undefined;
  } catch {
    return undefined;
  }
};

export const setDashboardCommentsReadAfter = (value: string) => {
  try {
    localStorage.setItem(DASHBOARD_COMMENTS_READ_AFTER_KEY, value);
  } catch {
    // ignore storage errors
  }
};

export const getDashboardTaskPath = (task: Task) => {
  const routeId = task.post?.id ?? task.postId ?? task.id;

  return `${ROUTES.TASK}/${routeId}?taskId=${task.id}`;
};

export const getDashboardCommentPath = (item: DashboardCommentItem) =>
  `${getDashboardTaskPath(item.task)}#comment-${item.comment.id}`;

export const sortCommentsChronologically = (
  comments: DashboardCommentItem[],
): DashboardCommentItem[] =>
  [...comments].sort(
    (left, right) =>
      new Date(left.comment.createdAt).getTime() -
      new Date(right.comment.createdAt).getTime(),
  );

export const getCommentsLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return 'комментарий';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'комментария';
  }

  return 'комментариев';
};

export const canCommentOnTask = (task: Task) =>
  Boolean(task.executorId && task.isExecutorApprove);

const truncateText = (text: string, maxLength = 140) => {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return `${lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated}…`;
};

export const mapTaskWithCommentsItem = (
  item: TaskWithCommentsItem,
  taskMap: Map<string, Task>,
): DashboardTaskCommentsItem => {
  const taskId = item.id || item.lastComment?.taskId || '';
  const mappedTask =
    taskMap.get(taskId) ??
    ({
      id: taskId,
      title: item.title ?? '',
      ownerId: item.ownerId,
      executorId: item.executorId ?? '',
      postId: item.postId ?? '',
      status: item.status ?? TASK_STATUS_ENUM.PREPARING,
      isExecutorApprove: item.isExecutorApprove ?? undefined,
      post: item.post,
    } as Task);

  return {
    task: mappedTask,
    lastComment: item.lastComment,
    commentsCount: item.commentsCount,
    unreadCount: item.unreadCount,
  };
};

export const mapActivityFeedItem = (
  item: TaskActivityFeedItem,
  taskMap: Map<string, Task>,
): DashboardActivityItem => {
  const embedded = item.task;
  const mappedTask =
    taskMap.get(item.taskId) ??
    (embedded
      ? ({
        id: embedded.id,
        title: embedded.title ?? '',
        ownerId: embedded.ownerId,
        executorId: embedded.executorId ?? '',
        postId: embedded.postId ?? '',
        post: embedded.post,
      } as Task)
      : undefined);

  if (mappedTask) {
    return { activity: item, task: mappedTask };
  }

  return {
    activity: item,
    task: {
      id: item.taskId,
      title: 'Задача',
      ownerId: embedded?.ownerId ?? '',
      executorId: embedded?.executorId ?? '',
      postId: embedded?.postId ?? '',
      post: embedded?.post,
    } as Task,
  };
};

const getPaletteColor = (palette: Theme['palette'], color: KanbanColumnColor) =>
  palette[color].main;

export const getTasksLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return 'задача';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'задачи';
  }

  return 'задач';
};

const getTaskTitle = (task: Task) =>
  task.title || task.post?.title || 'Задача';

const sortByFinalDateAsc = (left: Task, right: Task) => {
  const leftDate = dayjs(left.finalDate).valueOf();
  const rightDate = dayjs(right.finalDate).valueOf();

  if (leftDate !== rightDate) return leftDate - rightDate;

  return getTaskTitle(left).localeCompare(getTaskTitle(right), 'ru');
};

export const getStatusCounts = (tasks: Task[]): Partial<Record<TaskStatus, number>> => {
  const counts: Partial<Record<TaskStatus, number>> = {};

  tasks.forEach(task => {
    if (!ACTIVE_KANBAN_STATUSES.includes(task.status)) return;

    counts[task.status] = (counts[task.status] ?? 0) + 1;
  });

  return counts;
};

export const getStatusChartData = (
  statusCounts: Partial<Record<TaskStatus, number>>,
  palette: Theme['palette'],
): StatusChartDatum[] =>
  ACTIVE_KANBAN_STATUSES.flatMap(status => {
    const value = statusCounts[status] ?? 0;

    if (value <= 0) return [];

    const config = getTaskConfig(status);

    return [
      {
        status,
        id: status,
        value,
        label: TASK_STATUS_LABELS[status],
        color: getPaletteColor(palette, config?.color ?? 'primary'),
      },
    ];
  });

export const getOverdueTasks = (tasks: Task[]) =>
  tasks
    .filter(task => Boolean(task.finalDate) && isTaskOverdue(task))
    .sort(sortByFinalDateAsc);

export const getUpcomingDeadlineTasks = (
  tasks: Task[],
  days = UPCOMING_DEADLINE_DAYS,
) => {
  const today = startOfDay(new Date());
  const endDate = dayjs(today).add(days, 'day').endOf('day');

  return tasks
    .filter(task => {
      if (!task.finalDate || isTaskTerminal(task) || isTaskOverdue(task)) {
        return false;
      }

      const deadline = dayjs(task.finalDate);

      return (
        !deadline.isBefore(dayjs(today), 'day') &&
        !deadline.isAfter(endDate)
      );
    })
    .sort(sortByFinalDateAsc);
};

export const getCheckingTasks = (tasks: Task[]) =>
  tasks.filter(
    task =>
      task.status === TASK_STATUS_ENUM.CHECKING && !isTaskTerminal(task),
  );

export const getUrgentTasks = (tasks: Task[]) =>
  tasks.filter(task => task.urgent && !isTaskTerminal(task));

const isDeadlineToday = (task: Task) =>
  Boolean(task.finalDate) && dayjs(task.finalDate).isSame(dayjs(), 'day');

const matchesDashboardActionFilter = (task: Task, isCompany: boolean) =>
  isCompany ? task.isCompanyAction === true : task.isCompanyAction === false;

const sortDashboardTableTasks = (left: Task, right: Task) => {
  const leftToday = isDeadlineToday(left);
  const rightToday = isDeadlineToday(right);

  if (leftToday !== rightToday) {
    return leftToday ? -1 : 1;
  }

  if (leftToday && rightToday && left.finalDate && right.finalDate) {
    return sortByFinalDateAsc(left, right);
  }

  return dayjs(right.updatedAt).valueOf() - dayjs(left.updatedAt).valueOf();
};

export const getNearestDeadlineTasks = (tasks: Task[], isCompany: boolean) =>
  tasks
    .filter(task => {
      if (isTaskTerminal(task)) return false;

      return (
        isDeadlineToday(task) ||
        matchesDashboardActionFilter(task, isCompany)
      );
    })
    .sort(sortDashboardTableTasks);

export const getRecentUpdatedTasks = (
  tasks: Task[],
  limit = MAX_DASHBOARD_LIST_ITEMS,
) =>
  [...tasks]
    .filter(
      task =>
        task.status !== TASK_STATUS_ENUM.CANCELLED &&
        task.status !== TASK_STATUS_ENUM.CANCELLED_EXECUTOR,
    )
    .sort(
      (left, right) =>
        dayjs(right.updatedAt).valueOf() - dayjs(left.updatedAt).valueOf(),
    )
    .slice(0, limit);

export const getTaskDisplayTitle = getTaskTitle;

export const getCommentPreview = (comment: TaskComment) => {
  if (hasCommentText(comment.content)) {
    return truncateText(comment.content.trim());
  }

  const mediaCount = comment.media?.length ?? 0;

  if (mediaCount > 0) {
    return mediaCount === 1 ? 'Вложение' : `Вложения · ${mediaCount}`;
  }

  return 'Комментарий';
};

export const getDashboardTaskOptions = (tasks: Task[]) => {
  const seen = new Set<string>();

  return tasks
    .filter(task => {
      if (seen.has(task.id)) return false;
      seen.add(task.id);
      return true;
    })
    .map(task => ({
      id: task.id,
      title: getTaskTitle(task),
    }))
    .sort((left, right) => left.title.localeCompare(right.title, 'ru'));
};
