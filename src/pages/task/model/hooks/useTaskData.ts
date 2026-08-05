import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import {
  TASK_STATUS_ENUM,
  type Task,
  usePostByIdQuery,
  usePostTasksQuery,
} from '@/entities';

const CANCELLED_STATUSES = [TASK_STATUS_ENUM.ANNULLED] as const;

export const getTaskUserKey = (task: Task) => task.executorId || 'unassigned';

const matchesUserId = (task: Task, userId: string) =>
  getTaskUserKey(task) === userId || task.executor?.id === userId;

const pickFirstActive = (items: Task[]) =>
  items.find(
    item =>
      !CANCELLED_STATUSES.includes(
        item.status as (typeof CANCELLED_STATUSES)[number],
      ),
  ) ?? items[0];

/**
 * - только postId → первая активная задача
 * - postId + userId → первая задача этого исполнителя
 * - postId + userId + taskId → задача исполнителя с id === taskId
 */
const pickTaskFromList = (
  items: Task[],
  userId?: string | null,
  taskId?: string | null,
) => {
  if (!items.length) return null;

  let pool = items;

  if (userId) {
    const byUser = items.filter(item => matchesUserId(item, userId));

    if (byUser.length) {
      pool = byUser;
    }
  }

  if (taskId) {
    return pool.find(item => item.id === taskId) ?? pickFirstActive(pool) ?? null;
  }

  return pickFirstActive(pool) ?? null;
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
    setOverrideTask(null);
  }

  const { data: tasks, isLoading: isTasksLoading } = usePostTasksQuery(
    postId ?? null,
    {
      page: 1,
      limit: 100,
    },
  );

  const routeTask = useMemo(() => {
    if (!tasks?.items?.length) return null;

    return pickTaskFromList(tasks.items, userId, taskId);
  }, [tasks, userId, taskId]);

  const currentTask = useMemo(() => {
    const selected = overrideTask ?? routeTask;

    if (!selected) return null;

    return resolveFreshTask(selected, tasks?.items);
  }, [overrideTask, routeTask, tasks]);

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
    isLoading: isTasksLoading,
    isPostLoading,
    currentTask,
    setCurrentTask,
  };
};
