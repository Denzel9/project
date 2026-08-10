import { Add, Circle, } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMemo, useState, type MouseEvent } from 'react';

import {
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  getTaskStatusColor,
  executorToUserPartial,
  getUserName,
  isTaskAwaitingUserAction,
  useCreateTaskMutation,
  UserDisplayName,
  type Task,
} from '@/entities';
import { useAuthStore, useRequireEmailConfirmed } from '@/features';
import { useSnackbarStore } from '@/widgets';

import { CreateTaskDialog } from './CreateTaskDialog';
import { ExecutorListDialog } from './ExecutorListDialog';
import { TaskListDialog } from './TaskListDialog';
import { TaskSwitcherMoreMenu } from './TaskSwitcherMoreMenu';

type TaskSwitcherProps = {
  postId?: string | null;
  groupedTasks: Record<string, Task[]>;
  currentTask?: Task | null;
  cancelledTasks: Task[];
  onSelectTask: (taskId: string) => void;
  onSelectExecutor: (executorKey: string) => void;
  onTaskCreated?: (task: Task) => void;
  onEditTask?: () => void;
};

const getExecutorKey = (task: Task) => task.executorId || 'unassigned';

const getExecutorName = (task: Task) => {
  const user = executorToUserPartial(task.executor);

  return getUserName(user) || 'Не назначен';
};

const getExecutorInitials = (task: Task) => {
  const name = getExecutorName(task);

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
};

export const TaskSwitcher = ({
  postId,
  groupedTasks,
  currentTask,
  cancelledTasks,
  onSelectTask,
  onSelectExecutor,
  onTaskCreated,
  onEditTask,
}: TaskSwitcherProps) => {
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);
  const [isExecutorListOpen, setIsExecutorListOpen] = useState(false);
  const [isCancelledListOpen, setIsCancelledListOpen] = useState(false);
  const [createDialogExecutorKey, setCreateDialogExecutorKey] = useState<
    string | null
  >(null);

  const { setSnackbarOpen } = useSnackbarStore();
  const currentUserId = useAuthStore(state => state.id);
  const { requireEmailConfirmed } = useRequireEmailConfirmed();
  const { mutateAsync: createTask, isPending: isCreating } =
    useCreateTaskMutation();

  const isCancelledSelected =
    currentTask?.status === TASK_STATUS_ENUM.ANNULLED;
  const selectedExecutorKey =
    currentTask && !isCancelledSelected
      ? getExecutorKey(currentTask)
      : '';
  const executorTasks = useMemo(() => {
    const tasks = selectedExecutorKey
      ? (groupedTasks[selectedExecutorKey] ?? [])
      : [];

    return [...tasks].sort((a, b) => {
      const aAwaiting = isTaskAwaitingUserAction(a, currentUserId) ? 0 : 1;
      const bAwaiting = isTaskAwaitingUserAction(b, currentUserId) ? 0 : 1;

      if (aAwaiting !== bAwaiting) {
        return aAwaiting - bAwaiting;
      }

      const aCompleted = a.status === TASK_STATUS_ENUM.COMPLETED ? 1 : 0;
      const bCompleted = b.status === TASK_STATUS_ENUM.COMPLETED ? 1 : 0;

      if (aCompleted !== bCompleted) {
        return aCompleted - bCompleted;
      }

      return 0;
    });
  }, [currentUserId, groupedTasks, selectedExecutorKey]);

  const executorEntries = useMemo(
    () =>
      Object.entries(groupedTasks).sort(([, tasksA], [, tasksB]) =>
        getExecutorName(tasksA[0]).localeCompare(
          getExecutorName(tasksB[0]),
          'ru',
          { sensitivity: 'base' }
        )
      ),
    [groupedTasks]
  );

  const executorOptions = useMemo(
    () =>
      executorEntries.map(([executorKey, tasks]) => ({
        id: executorKey,
        label: getExecutorName(tasks[0]),
      })),
    [executorEntries]
  );

  const executorListItems = useMemo(
    () =>
      executorEntries.map(([id, tasks]) => ({
        id,
        tasks,
      })),
    [executorEntries]
  );

  const handleOpenCreateDialog = (
    event: MouseEvent,
    executorKey: string
  ) => {
    event.stopPropagation();
    event.preventDefault();

    if (!postId || isCreating) return;
    if (!requireEmailConfirmed()) return;

    setCreateDialogExecutorKey(executorKey);
  };

  const handleCreateTask = async ({
    title,
    executorId,
  }: {
    title: string;
    executorId: string | null;
  }) => {
    if (!postId) return;

    try {
      const task = await createTask({
        postId,
        ...(title && { title }),
        ...(executorId && { executorId }),
      });

      setSnackbarOpen(true, 'Задача успешно создана');
      setCreateDialogExecutorKey(null);
      onTaskCreated?.(task);
    } catch {
      setSnackbarOpen(true, 'Не удалось создать задачу');
    }
  };

  return (
    <Box
      sx={{
        p: 2,
        mb: 1,
        bgcolor: 'white',
        border: '1px solid',
        borderRadius: '32px',
        borderColor: 'divider',
      }}
    >
      <Stack
        spacing={1.5}
        direction="row"
        sx={{ alignItems: 'center' }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            flex: 1,
            minWidth: 0,
            alignItems: 'center',
            overflowX: 'auto',
            '&::-webkit-scrollbar': { height: 4 },
          }}
        >
          {executorEntries.map(([executorKey, tasks]) => {
            const representative = tasks[0];
            const isSelected = selectedExecutorKey === executorKey;

            return (
              <Chip
                key={executorKey}
                clickable
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                onClick={() => onSelectExecutor(executorKey)}
                icon={
                  <Avatar
                    src={representative.executor?.avatar || undefined}
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: 12,
                      bgcolor: isSelected ? 'primary.dark' : 'grey.300',
                    }}
                  >
                    {getExecutorInitials(representative)}
                  </Avatar>
                }
                label={
                  <Stack
                    spacing={1}
                    direction="row"
                    sx={{ alignItems: 'center' }}
                  >
                    <UserDisplayName
                      variant="body2"
                      withBadges={false}
                      user={executorToUserPartial(representative.executor)}
                    />

                    <Tooltip title='Количество активных задач'>
                      <Box
                        sx={{
                          px: 0.75,
                          height: 20,
                          minWidth: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          borderRadius: '10px',
                          alignItems: 'center',
                          display: 'inline-flex',
                          justifyContent: 'center',
                          color: isSelected ? 'white' : 'text.secondary',
                          bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                        }}
                      >
                        {tasks.length}
                      </Box>
                    </Tooltip>

                    <Tooltip title="Добавить задачу">
                      <span>
                        <IconButton
                          size="small"
                          disabled={isCreating || !postId}
                          aria-label="Добавить задачу"
                          onClick={event =>
                            handleOpenCreateDialog(event, executorKey)
                          }
                          onMouseDown={event => event.stopPropagation()}
                          sx={{
                            p: 0.25,
                            color: isSelected ? 'inherit' : 'text.secondary',
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                }
                sx={{
                  px: 0.5,
                  height: 40,
                  flexShrink: 0,
                  '& .MuiChip-icon': { ml: 0.5 },
                }}
              />
            );
          })}
        </Stack>

        <Button
          size="small"
          sx={{ px: 2 }}
          aria-label="Список исполнителей"
          onClick={() => setIsExecutorListOpen(true)}
        >
          Все исполнители
        </Button>

        {Boolean(cancelledTasks.length) && (
          <>
            <Divider
              flexItem
              orientation="vertical"
              sx={{ alignSelf: 'stretch', my: 0.5 }}
            />

            <Tooltip title="Отменённые задачи">
              <Chip
                clickable
                color="error"
                size="small"
                variant={isCancelledSelected ? 'filled' : 'outlined'}
                label={`Отменённые ${cancelledTasks.length}`}
                onClick={() => setIsCancelledListOpen(true)}
              />
            </Tooltip>
          </>
        )}

        <TaskSwitcherMoreMenu
          task={currentTask}
          onTaskCreated={onTaskCreated}
          onEdit={onEditTask}
        />
      </Stack>

      {Boolean(executorTasks.length > 1) && <Divider sx={{ my: 1.5 }} />}

      {Boolean(executorTasks.length > 1) && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          {executorTasks.length > 1 && (
            <Stack
              direction="row"
              sx={{
                overflowX: 'auto',
                gap: 1,
                scrollbarWidth: 'none',
              }}
            >
              {executorTasks.map(task => {
                const isActive = currentTask?.id === task.id;
                const isAwaitAction = isTaskAwaitingUserAction(
                  task,
                  currentUserId
                );

                return (
                  <Chip
                    clickable
                    key={task.id}
                    color={isActive ? 'primary' : 'default'}
                    variant={isActive ? 'filled' : 'outlined'}
                    onClick={() => onSelectTask(task.id)}
                    label={
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                      >
                        <Tooltip title={task.title}>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: { xs: 140, sm: 220 },
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {task.title && task.title.length > 20 ? task.title.slice(0, 20) + '...' : task.title || 'Без названия'}
                          </Typography>
                        </Tooltip>
                        <Chip
                          color={getTaskStatusColor(task.status, isActive)}
                          label={TASK_STATUS_LABELS[task.status]}
                          sx={{
                            height: 22,
                            '& .MuiChip-label': {
                              px: 0.75,
                              fontSize: 11,
                            },
                          }}
                        />
                        {isAwaitAction && (
                          <Tooltip title="Ожидает вашего действия">
                            <Circle
                              sx={{ color: 'warning.main', fontSize: 12 }}
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    }
                    sx={{ height: 32, maxWidth: '100%', '& .MuiChip-label': { pl: '12px', pr: '6px' } }}
                  />
                );
              })}
            </Stack>
          )}

          <Button
            size='small'
            sx={{ px: 2 }}
            aria-label="Список задач"
            onClick={() => setIsTaskListOpen(true)}
          >
            Все задачи
          </Button>
        </Stack>
      )}

      <ExecutorListDialog
        open={isExecutorListOpen}
        executors={executorListItems}
        currentExecutorId={selectedExecutorKey || undefined}
        onSelectExecutor={onSelectExecutor}
        onClose={() => setIsExecutorListOpen(false)}
      />

      <TaskListDialog
        open={isTaskListOpen}
        tasks={executorTasks}
        onSelectTask={onSelectTask}
        currentTaskId={currentTask?.id}
        onClose={() => setIsTaskListOpen(false)}
      />

      <TaskListDialog
        open={isCancelledListOpen}
        title="Отменённые задачи"
        tasks={cancelledTasks}
        onSelectTask={onSelectTask}
        currentTaskId={currentTask?.id}
        onClose={() => setIsCancelledListOpen(false)}
      />

      <CreateTaskDialog
        open={Boolean(createDialogExecutorKey)}
        isPending={isCreating}
        initialExecutorId={createDialogExecutorKey ?? undefined}
        executorOptions={executorOptions}
        onClose={() => setCreateDialogExecutorKey(null)}
        onConfirm={handleCreateTask}
      />
    </Box>
  );
};
