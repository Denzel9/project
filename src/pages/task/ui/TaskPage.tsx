import { Menu, MenuItem, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { TASK_STATUS_ENUM, type Task } from '@/entities';
import { ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import { useTaskData } from '../model/hooks/useTaskData';

import TaskItem from './TaskItem';
import { TaskSwitcher } from './TaskSwitcher';

const getExecutorKey = (task: Task) => task.executorId || 'unassigned';

export const TaskPage = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElMore, setAnchorElMore] = useState<null | HTMLElement>(null);

  const { currentTask, setCurrentTask, tasks, isLoading, isPostLoading, id, post } =
    useTaskData();

  const handleChangeTask = (taskId: string) => {
    const task = tasks?.items?.find(item => item.id === taskId);
    if (task) {
      setCurrentTask(task);
    }
  };

  const handleChangeCancelledTask = (taskId: string) => {
    handleChangeTask(taskId);
    setAnchorEl(null);
  };

  const activeTasks = useMemo(
    () =>
      tasks?.items?.filter(
        task =>
          task.status !== TASK_STATUS_ENUM.CANCELLED &&
          task.status !== TASK_STATUS_ENUM.CANCELLED_EXECUTOR
      ) || [],
    [tasks?.items]
  );

  const cancelledTasks =
    tasks?.items?.filter(
      task =>
        task.status === TASK_STATUS_ENUM.CANCELLED ||
        task.status === TASK_STATUS_ENUM.CANCELLED_EXECUTOR
    ) || [];

  const groupedTasks = useMemo(
    () =>
      activeTasks.reduce(
        (acc, task) => {
          const key = getExecutorKey(task);
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

    setCurrentTask(executorTasks[0]);
  };

  const showSwitcher = Boolean(cancelledTasks.length) || activeTasks.length > 1;

  return (
    <PageLayout title="Задача">
      {showSwitcher && (
        <>
          <TaskSwitcher
            groupedTasks={groupedTasks}
            currentTask={currentTask ?? undefined}
            cancelledTasks={cancelledTasks}
            onSelectTask={handleChangeTask}
            onSelectExecutor={handleChangeExecutor}
            onOpenCancelledMenu={event => setAnchorEl(event.currentTarget)}
            onOpenMoreMenu={event => setAnchorElMore(event.currentTarget)}
          />

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {cancelledTasks.map(task => (
              <MenuItem
                key={task.id}
                onClick={() => handleChangeCancelledTask(task.id)}
              >
                <Typography>{task.title ?? 'Без названия'}</Typography>
              </MenuItem>
            ))}
          </Menu>

          <Menu
            anchorEl={anchorElMore}
            open={Boolean(anchorElMore)}
            onClose={() => setAnchorElMore(null)}
          >
            <MenuItem
              target="_blank"
              component={Link}
              to={`${ROUTES.TASK}/${id}?taskId=${currentTask?.id}`}
            >
              <Typography>Открыть отдельно</Typography>
            </MenuItem>
          </Menu>
        </>
      )}

      {currentTask && (
        <TaskItem
          task={currentTask}
          post={post}
          isLoading={isLoading}
          isPostLoading={isPostLoading}
        />
      )}
    </PageLayout>
  );
};
