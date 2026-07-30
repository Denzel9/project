import { ListAlt, MoreVert } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  getTaskStatusColor,
  executorToUserPartial,
  getUserName,
  UserDisplayName,
  type Task,
} from '@/entities';

import { TaskListDialog } from './TaskListDialog';

type TaskSwitcherProps = {
  groupedTasks: Record<string, Task[]>;
  currentTask?: Task | null;
  cancelledTasks: Task[];
  onSelectTask: (taskId: string) => void;
  onSelectExecutor: (executorKey: string) => void;
  onOpenCancelledMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onOpenMoreMenu: (event: React.MouseEvent<HTMLElement>) => void;
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
  groupedTasks,
  currentTask,
  cancelledTasks,
  onSelectTask,
  onSelectExecutor,
  onOpenCancelledMenu,
  onOpenMoreMenu,
}: TaskSwitcherProps) => {
  const [isTaskListOpen, setIsTaskListOpen] = useState(false);

  const selectedExecutorKey = currentTask ? getExecutorKey(currentTask) : '';
  const executorTasks = selectedExecutorKey
    ? (groupedTasks[selectedExecutorKey] ?? [])
    : [];

  return (
    <Box
      sx={{
        py: 1.5,
        mb: 2,
        bgcolor: 'white',
        border: '1px solid',
        borderRadius: '32px',
        borderColor: 'divider',
        px: { xs: 1.5, md: 2 },
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
          {Object.entries(groupedTasks).map(([executorKey, tasks]) => {
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
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: 'center' }}
                  >
                    <UserDisplayName
                      variant="body2"
                      withBadges={false}
                      user={executorToUserPartial(representative.executor)}
                    />
                    <Box
                      sx={{
                        minWidth: 20,
                        height: 20,
                        px: 0.75,
                        display: 'inline-flex',
                        borderRadius: '10px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                        color: isSelected ? 'white' : 'text.secondary',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {tasks.length}
                    </Box>
                  </Stack>
                }
                sx={{
                  height: 40,
                  px: 0.5,
                  flexShrink: 0,
                  '& .MuiChip-icon': { ml: 0.5 },
                }}
              />
            );
          })}
        </Stack>

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
                variant={
                  currentTask?.status === TASK_STATUS_ENUM.CANCELLED ||
                  currentTask?.status === TASK_STATUS_ENUM.CANCELLED_EXECUTOR
                    ? 'filled'
                    : 'outlined'
                }
                label={`Отменённые ${cancelledTasks.length}`}
                onClick={onOpenCancelledMenu}
              />
            </Tooltip>
          </>
        )}

        <IconButton
          size="small"
          onClick={onOpenMoreMenu}
        >
          <MoreVert />
        </IconButton>
      </Stack>

      {Boolean(executorTasks.length) && <Divider sx={{ my: 1.5 }} />}

      {Boolean(executorTasks.length) && (
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

                return (
                  <Chip
                    key={task.id}
                    clickable
                    color={isActive ? 'primary' : 'default'}
                    variant={isActive ? 'filled' : 'outlined'}
                    onClick={() => onSelectTask(task.id)}
                    label={
                      <Stack
                        direction="row"
                        spacing={0.75}
                        sx={{ alignItems: 'center' }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            maxWidth: { xs: 140, sm: 220 },
                            fontWeight: isActive ? 600 : 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {task.title || 'Без названия'}
                        </Typography>
                        <Chip
                          color={getTaskStatusColor(task.status)}
                          label={TASK_STATUS_LABELS[task.status]}
                          sx={{
                            height: 22,
                            '& .MuiChip-label': {
                              px: 0.75,
                              fontSize: 11,
                            },
                          }}
                        />
                      </Stack>
                    }
                    sx={{ height: 32, maxWidth: '100%' }}
                  />
                );
              })}
            </Stack>
          )}

          <Tooltip title="Список задач">
            <IconButton
              aria-label="Список задач"
              onClick={() => setIsTaskListOpen(true)}
            >
              <ListAlt />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      <TaskListDialog
        open={isTaskListOpen}
        onClose={() => setIsTaskListOpen(false)}
        tasks={executorTasks}
        currentTaskId={currentTask?.id}
        onSelectTask={onSelectTask}
      />
    </Box>
  );
};
