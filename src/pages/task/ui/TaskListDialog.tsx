import { Close, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
  TASK_STATUS_LABELS,
  executorToUserPartial,
  getTaskStatusColor,
  getUserName,
  type Task,
} from '@/entities';

type TaskListDialogProps = {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  currentTaskId?: string;
  title?: string;
  onSelectTask: (taskId: string) => void;
  /** Показывать исполнителя у пунктов основного списка (для диалога «Отменённые») */
  showExecutor?: boolean;
  /** Для mobile: отдельный список под основными задачами */
  cancelledTasks?: Task[];
};

const getExecutorLabel = (task: Task) =>
  getUserName(executorToUserPartial(task.executor)) || 'Не назначен';

const TaskListItem = ({
  task,
  isActive,
  onSelect,
  showExecutor = false,
}: {
  task: Task;
  isActive: boolean;
  onSelect: (taskId: string) => void;
  showExecutor?: boolean;
}) => (
  <Stack
    direction="row"
    spacing={1.5}
    onClick={() => onSelect(task.id)}
    sx={{
      p: 1.5,
      cursor: 'pointer',
      borderRadius: '12px',
      alignItems: 'center',
      bgcolor: isActive ? 'primary.light' : 'transparent',
      '&:hover': {
        bgcolor: isActive ? 'primary.light' : 'action.hover',
      },
    }}
  >
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography
        variant="body1"
        noWrap
        sx={{
          fontWeight: isActive ? 600 : 500,
          color: isActive ? 'common.white' : 'text.primary',
        }}
      >
        {task.title || 'Без названия'}
      </Typography>

      {showExecutor && (
        <Typography
          variant="caption"
          noWrap
          sx={{
            display: 'block',
            color: isActive ? 'rgba(255,255,255,0.85)' : 'text.secondary',
          }}
        >
          {getExecutorLabel(task)}
        </Typography>
      )}
    </Box>

    <Chip
      size="small"
      color={getTaskStatusColor(task.status)}
      label={TASK_STATUS_LABELS[task.status]}
      sx={{
        height: 22,
        flexShrink: 0,
        '& .MuiChip-label': { px: 0.75, fontSize: 11 },
      }}
    />
  </Stack>
);

export const TaskListDialog = ({
  open,
  onClose,
  tasks,
  currentTaskId,
  title = 'Список задач',
  onSelectTask,
  showExecutor = false,
  cancelledTasks = [],
}: TaskListDialogProps) => {
  const [isCancelledOpen, setIsCancelledOpen] = useState(false);

  const showCancelledSection = cancelledTasks.length > 0;

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setIsCancelledOpen(false);
      }, 0);
    }
  }, [open]);

  const handleSelect = (taskId: string) => {
    onSelectTask(taskId);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: '24px', p: { xs: 2, sm: 3 }, width: '100%', m: 0 },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">{title}</Typography>
        <IconButton
          aria-label="Закрыть"
          onClick={onClose}
        >
          <Close />
        </IconButton>
      </Stack>

      <Box
        sx={{
          maxHeight: 420,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          p: 1,
        }}
      >
        {!tasks.length && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 3 }}
          >
            Нет задач
          </Typography>
        )}

        <Stack
          spacing={1}
          direction="column"
        >
          {tasks.map(task => (
            <TaskListItem
              key={task.id}
              task={task}
              isActive={currentTaskId === task.id}
              onSelect={handleSelect}
              showExecutor={showExecutor}
            />
          ))}
        </Stack>

        {showCancelledSection && (
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: tasks.length ? 1 : 0 }}>
            <Stack
              direction="row"
              spacing={1}
              onClick={() => setIsCancelledOpen(prev => !prev)}
              sx={{
                p: 1.5,
                cursor: 'pointer',
                borderRadius: '12px',
                alignItems: 'center',
                justifyContent: 'space-between',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: 'error.main' }}
              >
                Отменённые {cancelledTasks.length}
              </Typography>
              {isCancelledOpen ? (
                <ExpandLess sx={{ color: 'error.main' }} />
              ) : (
                <ExpandMore sx={{ color: 'error.main' }} />
              )}
            </Stack>

            <Collapse
              in={isCancelledOpen}
              timeout="auto"
              unmountOnExit
            >
              <Stack
                spacing={1}
                direction="column"
                sx={{ pt: 0.5 }}
              >
                {cancelledTasks.map(task => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    isActive={currentTaskId === task.id}
                    onSelect={handleSelect}
                    showExecutor
                  />
                ))}
              </Stack>
            </Collapse>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};
