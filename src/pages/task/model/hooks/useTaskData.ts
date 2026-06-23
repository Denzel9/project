import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import {
  usePostTasksQuery,
  useTaskByIdQuery,
  TASK_STATUS_ENUM,
  type Task,
} from '@/entities';

export const useTaskData = () => {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const inviteId = searchParams.get('inviteId');

  const { data: tasks, isLoading } = usePostTasksQuery(
    id ?? null,
    {
      page: 1,
      limit: 20,
    },
    Boolean(taskId)
  );

  const { data: task } = useTaskByIdQuery(taskId ?? null, Boolean(!taskId));

  useEffect(() => {
    if (task && !tasks?.items?.length && !currentTask) {
      setTimeout(() => {
        setCurrentTask(task);
      }, 0);
    }
  }, [task, tasks?.items?.length, currentTask]);

  useEffect(() => {
    if (tasks?.items?.length && !currentTask) {
      setTimeout(() => {
        const task = tasks?.items?.find(
          task => ![TASK_STATUS_ENUM.CANCELLED, TASK_STATUS_ENUM.CANCELLED_EXECUTOR].includes(task.status as TASK_STATUS_ENUM) && task.id === inviteId
        );
        setCurrentTask(task ?? tasks?.items?.[0]);
      }, 0);
    }
  }, [tasks, currentTask, inviteId]);

  useEffect(() => {
    if (!currentTask?.id) return;

    const updatedTask =
      task?.id === currentTask.id
        ? task
        : tasks?.items?.find(item => item.id === currentTask.id);

    if (
      updatedTask &&
      (updatedTask.updatedAt !== currentTask.updatedAt ||
        updatedTask.status !== currentTask.status ||
        updatedTask.isExecutorApprove !== currentTask.isExecutorApprove)
    ) {
      setTimeout(() => {
        setCurrentTask(updatedTask);
      }, 0);
    }
  }, [
    task,
    tasks?.items,
    currentTask?.id,
    currentTask?.updatedAt,
    currentTask?.status,
    currentTask?.isExecutorApprove,
  ]);

  return {
    id,
    tasks,
    isLoading,
    currentTask,
    setCurrentTask,
  };
};
