import { MoreVert } from '@mui/icons-material';
import {
  Tabs,
  Tab,
  Chip,
  Stack,
  Divider,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Box,
  IconButton,
  TextField,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { TASK_STATUS_ENUM, type Task } from '@/entities';
import { ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import { useTaskData } from '../model/hooks/useTaskData';

import TaskItem from './TaskItem';

export const TaskPage = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElMore, setAnchorElMore] = useState<null | HTMLElement>(null);

  const { currentTask, setCurrentTask, tasks, isLoading, id } = useTaskData();

  const handleChangeTask = (taskId: string) => {
    const task = tasks?.items?.find(task => task.id === taskId);
    if (task) {
      setCurrentTask(task);
    }
  };

  const handleChangeCancelledTask = (taskId: string) => {
    handleChangeTask(taskId);
    setAnchorEl(null);
  };

  const getExecutorKey = (task: Task) => task.executorId || 'unassigned';

  const activeTasks = useMemo(
    () =>
      tasks?.items?.filter(
        task => task.status !== TASK_STATUS_ENUM.CANCELLED
      ) || [],
    [tasks?.items]
  );

  const cancelledTasks =
    tasks?.items?.filter(
      task =>
        task.status === TASK_STATUS_ENUM.CANCELLED ||
        task.isExecutorApprove === false
    ) || [];

  const groupedTasks = useMemo(() => {
    return activeTasks.reduce(
      (acc, task) => {
        const key = getExecutorKey(task);
        acc[key] = [...(acc[key] || []), task];
        return acc;
      },
      {} as Record<string, Task[]>
    );
  }, [activeTasks]);

  const getLabel = (task: Task) => {
    if (task.executor?.name && task.executor?.lastName) {
      return `${task.executor?.name} ${task.executor?.lastName} ${groupedTasks[getExecutorKey(task)]?.length}`;
    }

    return `Не назначено ${groupedTasks[getExecutorKey(task)]?.length}`;
  };

  const handleChangeExecutor = (executorKey: string) => {
    const executorTasks = groupedTasks[executorKey];
    if (!executorTasks?.length) return;

    if (executorTasks.some(task => task.id === currentTask?.id)) return;

    setCurrentTask(executorTasks[0]);
  };

  const selectedExecutorKey =
    currentTask && currentTask.status !== TASK_STATUS_ENUM.CANCELLED
      ? getExecutorKey(currentTask)
      : false;

  return (
    <PageLayout title="Задача">
      {Boolean(cancelledTasks?.length || activeTasks?.length > 1) && (
        <Stack
          spacing={1}
          direction="row"
          sx={{ alignItems: 'center', mb: 2, px: 2 }}
        >
          {Boolean(cancelledTasks?.length) && (
            <>
              <Tooltip title="Отмененные задачи">
                <Chip
                  color="error"
                  size="small"
                  label={
                    currentTask?.status === TASK_STATUS_ENUM.CANCELLED
                      ? (currentTask?.title ?? 'Без названия')
                      : cancelledTasks?.length
                  }
                  onClick={event => setAnchorEl(event.currentTarget)}
                />
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                {cancelledTasks?.map(task => (
                  <MenuItem
                    key={task.id}
                    onClick={() => handleChangeCancelledTask(task.id)}
                  >
                    <Typography>{task?.title ?? 'Без названия'}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {Boolean(cancelledTasks?.length) && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{ height: '24px', width: '1px', alignSelf: 'center', pl: 2 }}
            />
          )}

          <Stack
            direction="row"
            sx={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Tabs
              value={selectedExecutorKey}
              onChange={(_, executorKey) => handleChangeExecutor(executorKey)}
            >
              {Object.entries(groupedTasks).map(
                ([executorKey, executorTasks]) => {
                  const tabTask =
                    executorTasks.find(task => task.id === currentTask?.id) ??
                    executorTasks[0];

                  return (
                    <Tab
                      key={executorKey}
                      value={executorKey}
                      sx={{
                        textTransform: 'none',
                        color:
                          !tabTask?.isExecutorApprove && tabTask?.executor?.id
                            ? 'rgba(145, 145, 145, 0.5)'
                            : 'primary',
                      }}
                      label={
                        executorTasks.length > 1 ? (
                          <TextField
                            select
                            size="small"
                            variant="outlined"
                            label={getLabel(tabTask)}
                            value={
                              currentTask &&
                              executorTasks.some(
                                task => task.id === currentTask.id
                              )
                                ? currentTask.id
                                : executorTasks[0].id
                            }
                            onChange={e => handleChangeTask(e.target.value)}
                          >
                            {executorTasks.map(task => (
                              <MenuItem
                                key={task.id}
                                value={task.id}
                              >
                                {task?.title ?? 'Без названия'}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          getLabel(tabTask)
                        )
                      }
                    />
                  );
                }
              )}
            </Tabs>
          </Stack>

          <Box>
            <IconButton onClick={event => setAnchorElMore(event.currentTarget)}>
              <MoreVert />
            </IconButton>
          </Box>

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
        </Stack>
      )}

      {currentTask && (
        <TaskItem
          task={currentTask}
          isLoading={isLoading}
        />
      )}
    </PageLayout>
  );
};
