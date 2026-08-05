import { useMemo } from 'react';
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
  const [, setSearchParams] = useSearchParams();
  const {
    currentTask,
    setCurrentTask,
    tasks,
    isLoading,
    isPostLoading,
    id,
    post,
  } = useTaskData();

  const syncTaskInUrl = (task: Task) => {
    setSearchParams(
      {
        userId: getTaskUserKey(task),
        taskId: task.id,
      },
      { replace: true },
    );
  };

  const handleChangeTask = (taskId: string) => {
    const task = tasks?.items?.find(item => item.id === taskId);
    if (!task) return;

    setCurrentTask(task);
    syncTaskInUrl(task);
  };

  const activeTasks = useMemo(
    () =>
      tasks?.items?.filter(
        task => task.status !== TASK_STATUS_ENUM.ANNULLED
      ) || [],
    [tasks?.items]
  );

  const cancelledTasks =
    tasks?.items?.filter(
      task => task.status === TASK_STATUS_ENUM.ANNULLED
    ) || [];

  const groupedTasks = useMemo(
    () =>
      activeTasks.reduce(
        (acc, task) => {
          const key = getTaskUserKey(task);
          acc[key] = [...(acc[key] || []), task];
          return acc;
        },
        {} as Record<string, Task[]>
      ),
    [activeTasks]
  );

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
      <TaskSwitcher
        postId={id}
        currentTask={currentTask}
        groupedTasks={groupedTasks}
        cancelledTasks={cancelledTasks}
        onSelectTask={handleChangeTask}
        onSelectExecutor={handleChangeExecutor}
        onTaskCreated={handleTaskCreated}
      />

      {currentTask && (
        <TaskItem
          key={currentTask.id}
          post={post}
          task={currentTask}
          isLoading={isLoading}
          isPostLoading={isPostLoading}
        />
      )}
    </PageLayout>
  );
};
