import { MoreVert } from '@mui/icons-material';
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

import {
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  getTaskStatusColor,
  type Task,
} from '@/entities';

type TaskSwitcherProps = {
  groupedTasks: Record<string, Task[]>;
  currentTask?: Task;
  cancelledTasks: Task[];
  onSelectTask: (taskId: string) => void;
  onSelectExecutor: (executorKey: string) => void;
  onOpenCancelledMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onOpenMoreMenu: (event: React.MouseEvent<HTMLElement>) => void;
};

const getExecutorKey = (task: Task) => task.executorId || 'unassigned';

const getExecutorName = (task: Task) => {
  if (task.executor?.name) {
    return `${task.executor.name} ${task.executor.lastName ?? ''}`.trim();
  }

  return 'Не назначен';
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

const isExecutorPending = (task: Task) =>
  Boolean(task.executorId) && task.isExecutorApprove !== true;

export const TaskSwitcher = ({
  groupedTasks,
  currentTask,
  cancelledTasks,
  onSelectTask,
  onSelectExecutor,
  onOpenCancelledMenu,
  onOpenMoreMenu,
}: TaskSwitcherProps) => {
  const selectedExecutorKey = currentTask ? getExecutorKey(currentTask) : '';
  const executorTasks = selectedExecutorKey
    ? (groupedTasks[selectedExecutorKey] ?? [])
    : [];

  return (
    <Box
      sx={{
        px: { xs: 1.5, md: 2 },
        py: 1.5,
        mb: 2,
        bgcolor: 'white',
        borderRadius: '24px',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'center' }}
      >
        {Boolean(cancelledTasks.length) && (
          <>
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
                label={`Отменённые · ${cancelledTasks.length}`}
                onClick={onOpenCancelledMenu}
              />
            </Tooltip>

            <Divider
              flexItem
              orientation="vertical"
              sx={{ alignSelf: 'stretch', my: 0.5 }}
            />
          </>
        )}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 0.5,
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
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isSelected ? 600 : 500,
                        opacity: isExecutorPending(representative) ? 0.7 : 1,
                      }}
                    >
                      {getExecutorName(representative)}
                    </Typography>
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
        </Box>

        <IconButton
          size="small"
          onClick={onOpenMoreMenu}
        >
          <MoreVert />
        </IconButton>
      </Stack>

      {executorTasks.length > 1 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1.5,
            pt: 1.5,
            flexWrap: 'wrap',
            gap: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          {executorTasks.map(task => {
            const isActive = currentTask?.id === task.id;

            return (
              <Chip
                key={task.id}
                clickable
                size="small"
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
                      size="small"
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
    </Box>
  );
};
