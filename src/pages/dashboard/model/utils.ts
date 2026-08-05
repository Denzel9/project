
import {
  TASK_STATUS_ENUM,
  type Task,
  type TaskActivity,
  type TaskActivityFeedItem,
  type TaskComment,
  type TaskLastCommentPreview,
  type TaskWithCommentsItem,
  type TaskWithCommentsRecipient,
} from '@/entities';
import { getTaskStatsCount, type TaskStats } from '@/entities';
import { getUserName, type User } from '@/entities/user';
import { hasCommentText } from '@/pages/task/model/lib/commentMedia';
import { ROUTES } from '@/shared';

import type { DashboardCardVariant } from './types';

export const getDashboardCardCount = (
  variant: DashboardCardVariant,
  stats?: TaskStats,
): number => getTaskStatsCount(variant, stats);

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
  recipient: TaskWithCommentsRecipient | null;
  lastComment: TaskLastCommentPreview;
  commentsCount: number;
  unreadCount: number;
};

export const getDashboardTaskPath = (task: Task) => {
  return `${ROUTES.TASK}/${task.id}?taskId=${task.id}`;
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

export const getTasksLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return 'задача';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'задачи';
  }

  return 'задач';
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
  const taskId = item.id || '';
  const mappedTask =
    taskMap.get(taskId) ??
    ({
      id: taskId,
      title: item.title ?? '',
      ownerId: item.ownerId ?? '',
      executorId: item.executorId ?? '',
      postId: item.postId ?? '',
      status: item.status ?? TASK_STATUS_ENUM.PREPARING,
      isExecutorApprove: item.isExecutorApprove ?? undefined,
      post: item.post,
    } as Task);

  return {
    task: mappedTask,
    recipient: item.recipient,
    lastComment: item.lastComment,
    commentsCount: item.commentsCount,
    unreadCount: item.unreadCount ?? 0,
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

const getTaskTitle = (task: Task) =>
  task.title || task.post?.title || 'Задача';

export const getTaskDisplayTitle = getTaskTitle;

export const getCommentPreview = (
  comment?:
    | TaskComment
    | TaskLastCommentPreview
    | {
        preview?: string
        content?: string
        media?: TaskComment['media']
      }
    | null,
) => {
  if (!comment) return 'Комментарий'

  const previewText =
    'preview' in comment && typeof comment.preview === 'string'
      ? comment.preview.trim()
      : ''

  if (previewText) {
    if (previewText === '[медиа]') return 'Вложение'
    return truncateText(previewText)
  }

  const fullComment = comment as {
    content?: string
    media?: TaskComment['media']
  }
  const content = fullComment.content ?? ''

  if (hasCommentText(content)) {
    return truncateText(content.trim())
  }

  const mediaCount = fullComment.media?.length ?? 0

  if (mediaCount > 0) {
    return mediaCount === 1 ? 'Вложение' : `Вложения · ${mediaCount}`
  }

  return 'Комментарий'
}

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

export const getDashboardTaskPersonLabel = (task: Task, isCompany: boolean) => {
  if (isCompany) {
    if (!task.executor) return null;

    return getUserName(task.executor as Partial<User>) || null;
  }

  return (
    task.owner?.companyProfile?.companyName ??
    getUserName(task.owner as Partial<User>) ??
    null
  );
};

export const getDashboardTaskPersonId = (task: Task, isCompany: boolean) =>
  isCompany ? (task.executorId ?? null) : (task.ownerId ?? null);

export const getDashboardTaskPersonOptions = (
  tasks: Task[],
  isCompany: boolean,
) => {
  const seen = new Set<string>();

  return tasks
    .flatMap(task => {
      const id = getDashboardTaskPersonId(task, isCompany);
      const label = getDashboardTaskPersonLabel(task, isCompany);

      if (!id || !label || seen.has(id)) return [];

      seen.add(id);

      return [{ id, label }];
    })
    .sort((left, right) => left.label.localeCompare(right.label, 'ru'));
};



