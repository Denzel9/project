import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import { TASK_STATUS_ENUM, type Task } from '@/entities';
import { PageLayout } from '@/widgets';

import {
  getTaskUserKey,
  useTaskData,
} from '../model/hooks/useTaskData';

import TaskItem from './TaskItem';
import { TaskSwitcher } from './TaskSwitcher';

export const TaskPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [editRequestId, setEditRequestId] = useState(0);
  const {
    currentTask,
    setCurrentTask,
    tasks,
    isSolo,
    isLoading,
    isPostLoading,
    id,
    post,
  } = useTaskData();

  const syncTaskInUrl = (task: Task) => {
    const params: Record<string, string> = {
      userId: getTaskUserKey(task),
      taskId: task.id,
    };

    if (task.isArchived) {
      params.solo = '1';
    }

    setSearchParams(params, { replace: true });
  };

  useEffect(() => {
    if (!currentTask) return;

    const nextUserId = getTaskUserKey(currentTask);
    const urlUserId = searchParams.get('userId');
    const urlTaskId = searchParams.get('taskId');

    if (urlTaskId === currentTask.id && urlUserId !== nextUserId) {
      syncTaskInUrl(currentTask);
    }
  }, [currentTask, searchParams]);

  const handleChangeTask = (taskId: string) => {
    const task = tasks?.items?.find(item => item.id === taskId);
    if (!task) return;

    setCurrentTask(task);
    syncTaskInUrl(task);
  };

  const handleSelectTaskItem = (task: Task) => {
    setCurrentTask(task);
    syncTaskInUrl(task);
  };

  const activeTasks = useMemo(
    () =>
      tasks?.items?.filter(
        task =>
          task.status !== TASK_STATUS_ENUM.ANNULLED &&
          task.status !== TASK_STATUS_ENUM.COMPLETED &&
          !task.isArchived,
      ) || [],
    [tasks?.items]
  );

  const cancelledTasks =
    tasks?.items?.filter(
      task => task.status === TASK_STATUS_ENUM.ANNULLED
    ) || [];

  const groupedTasks = useMemo(() => {
    const groups = activeTasks.reduce(
      (acc, task) => {
        const key = getTaskUserKey(task);
        acc[key] = [...(acc[key] || []), task];
        return acc;
      },
      {} as Record<string, Task[]>
    );

    if (
      currentTask &&
      !currentTask.isArchived &&
      (currentTask.status === TASK_STATUS_ENUM.ANNULLED ||
        currentTask.status === TASK_STATUS_ENUM.COMPLETED)
    ) {
      const key = getTaskUserKey(currentTask);
      const existing = groups[key] ?? [];

      if (!existing.some(task => task.id === currentTask.id)) {
        groups[key] = [...existing, currentTask];
      }
    }

    return groups;
  }, [activeTasks, currentTask]);

  const handleChangeExecutor = (executorKey: string) => {
    const executorTasks = groupedTasks[executorKey];
    if (!executorTasks?.length) return;

    if (executorTasks.some(task => task.id === currentTask?.id)) return;

    const task = executorTasks[0];
    setCurrentTask(task);
    syncTaskInUrl(task);
  };

  const handleTaskCreated = (task: Task) => {
    setCurrentTask(task);
    syncTaskInUrl(task);
  };

  return (
    <PageLayout>
      {!isSolo && (
        <TaskSwitcher
          postId={id}
          currentTask={currentTask}
          groupedTasks={groupedTasks}
          cancelledTasks={cancelledTasks}
          onSelectTask={handleChangeTask}
          onSelectTaskItem={handleSelectTaskItem}
          onSelectExecutor={handleChangeExecutor}
          onTaskCreated={handleTaskCreated}
          onEditTask={() => setEditRequestId(value => value + 1)}
        />
      )}

      {currentTask && (
        <TaskItem
          key={currentTask.id}
          post={post}
          task={currentTask}
          isLoading={isLoading}
          isPostLoading={isPostLoading}
          editRequestId={editRequestId}
        />
      )}
    </PageLayout>
  );
};
