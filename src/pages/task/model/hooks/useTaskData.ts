import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import {
  usePostTasksQuery,
  useTaskByIdQuery,
  TASK_STATUS_ENUM,
  type Task,
  usePostByIdQuery,
} from '@/entities';

const CANCELLED_STATUSES = [
  TASK_STATUS_ENUM.CANCELLED,
  TASK_STATUS_ENUM.CANCELLED_EXECUTOR,
] as const;

const pickTaskFromList = (items: Task[], inviteId?: string | null) => {
  if (inviteId) {
    const byInvite = items.find(item => item.id === inviteId);

    if (byInvite) return byInvite;
  }

  return (
    items.find(
      item =>
        !CANCELLED_STATUSES.includes(
          item.status as (typeof CANCELLED_STATUSES)[number],
        ),
    ) ?? items[0]
  );
};

const resolveFreshTask = (
  task: Task,
  taskById?: Task,
  tasks?: Task[],
) => {
  const updated =
    taskById?.id === task.id
      ? taskById
      : tasks?.find(item => item.id === task.id);

  return updated ?? task;
};

export const useTaskData = () => {
  const { id: postId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const inviteId = searchParams.get('inviteId');

  const routeKey = `${postId ?? ''}:${taskId ?? ''}:${inviteId ?? ''}`;

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
      limit: 20,
    },
    Boolean(taskId),
  );

  const { data: taskById, isLoading: isTaskLoading } = useTaskByIdQuery(
    taskId ?? null,
    Boolean(!taskId),
  );



  const routeTask = useMemo(() => {
    if (taskId) {
      return taskById?.id === taskId ? taskById : null;
    }

    if (!tasks?.items?.length) return null;

    return pickTaskFromList(tasks.items, inviteId);
  }, [taskId, taskById, tasks, inviteId]);

  const currentTask = useMemo(() => {
    const selected = overrideTask ?? routeTask;

    if (!selected) return null;

    return resolveFreshTask(selected, taskById, tasks?.items);
  }, [overrideTask, routeTask, taskById, tasks]);

  const setCurrentTask = (task: Task | null) => {
    setOverrideTask(task);
  };

  const { data: post, isFetching: isPostLoading } = usePostByIdQuery(
    currentTask?.post?.id ?? null,
  );



  const isLoading = isTasksLoading || isTaskLoading;

  return {
    id: postId,
    post,
    tasks,
    isLoading,
    isPostLoading,
    currentTask,
    setCurrentTask,
  };
};
