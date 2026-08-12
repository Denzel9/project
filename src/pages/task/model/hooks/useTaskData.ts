import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import {
  TASK_STATUS_ENUM,
  type Task,
  usePostByIdQuery,
  usePostTasksQuery,
  useTaskByIdQuery,
} from '@/entities';

const CANCELLED_STATUSES = [TASK_STATUS_ENUM.ANNULLED] as const;
const INACTIVE_STATUSES = [
  TASK_STATUS_ENUM.ANNULLED,
  TASK_STATUS_ENUM.COMPLETED,
] as const;

export const getTaskUserKey = (task: Task) => task.executorId || 'unassigned';

const matchesUserId = (task: Task, userId: string) =>
  getTaskUserKey(task) === userId || task.executor?.id === userId;

const isActiveTask = (task: Task) =>
  !task.isArchived &&
  !INACTIVE_STATUSES.includes(
    task.status as (typeof INACTIVE_STATUSES)[number],
  );

const pickFirstActive = (items: Task[]) =>
  items.find(isActiveTask) ??
  items.find(
    item =>
      !CANCELLED_STATUSES.includes(
        item.status as (typeof CANCELLED_STATUSES)[number],
      ),
  ) ??
  items[0];

/**
 * - только postId → первая активная задача
 * - postId + taskId → задача с id === taskId (без подмены другой)
 * - postId + userId → первая активная задача этого исполнителя
 */
const pickTaskFromList = (
  items: Task[],
  userId?: string | null,
  taskId?: string | null,
) => {
  if (taskId) {
    return items.find(item => item.id === taskId) ?? null;
  }

  if (!items.length) return null;

  if (userId) {
    const byUser = items.filter(item => matchesUserId(item, userId));

    if (byUser.length) {
      return pickFirstActive(byUser);
    }
  }

  return pickFirstActive(items);
};

const resolveFreshTask = (task: Task, tasks?: Task[]) =>
  tasks?.find(item => item.id === task.id) ?? task;

export const useTaskData = () => {
  const { id: postId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  /** `inviteId` — совместимость со старыми ссылками */
  const userId =
    searchParams.get('userId') ?? searchParams.get('inviteId');

  const routeKey = `${postId ?? ''}:${userId ?? ''}:${taskId ?? ''}`;

  const [overrideTask, setOverrideTask] = useState<Task | null>(null);
  const [routeKeySnapshot, setRouteKeySnapshot] = useState(routeKey);

  if (routeKeySnapshot !== routeKey) {
    setRouteKeySnapshot(routeKey);
    // Не сбрасываем override, если он как раз выбранная по URL задача
    // (иначе архивные/вне списка теряются сразу после syncTaskInUrl).
    setOverrideTask(prev => (prev && taskId && prev.id === taskId ? prev : null));
  }

  const { data: tasks, isLoading: isTasksLoading } = usePostTasksQuery(
    postId ?? null,
    {
      page: 1,
      limit: 100,
    },
  );

  const taskFromList = useMemo(() => {
    if (!tasks?.items) return null;

    return pickTaskFromList(tasks.items, userId, taskId);
  }, [tasks, userId, taskId]);

  const shouldFetchTaskById = Boolean(
    taskId &&
    !taskFromList &&
    !(overrideTask && overrideTask.id === taskId),
  );

  const { data: taskById, isLoading: isTaskByIdLoading } = useTaskByIdQuery(
    shouldFetchTaskById ? taskId : null,
  );

  const routeTask = useMemo(() => {
    if (taskId) {
      if (taskFromList?.id === taskId) return taskFromList;
      if (taskById?.id === taskId) return taskById;
      return null;
    }

    return taskFromList;
  }, [taskId, taskFromList, taskById]);

  const currentTask = useMemo(() => {
    const selected =
      (overrideTask && (!taskId || overrideTask.id === taskId)
        ? overrideTask
        : null) ?? routeTask;

    if (!selected) return null;

    return resolveFreshTask(selected, tasks?.items);
  }, [overrideTask, routeTask, tasks, taskId]);

  const setCurrentTask = (task: Task | null) => {
    setOverrideTask(task);
  };

  const { data: post, isFetching: isPostLoading } = usePostByIdQuery(
    currentTask?.postId ?? currentTask?.post?.id ?? postId ?? null,
  );

  return {
    id: postId,
    post,
    tasks,
    isLoading: isTasksLoading || (shouldFetchTaskById && isTaskByIdLoading),
    isPostLoading,
    currentTask,
    setCurrentTask,
  };
};
