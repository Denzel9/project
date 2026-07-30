import { Close } from '@mui/icons-material';
import {
  Box,
  Chip,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import {
  TASK_STATUS_LABELS,
  getTaskStatusColor,
  type Task,
} from '@/entities';

type TaskListDialogProps = {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  currentTaskId?: string;
  onSelectTask: (taskId: string) => void;
};

export const TaskListDialog = ({
  open,
  onClose,
  tasks,
  currentTaskId,
  onSelectTask,
}: TaskListDialogProps) => {
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
          sx: { borderRadius: '24px', p: { xs: 2, sm: 3 } },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Список задач</Typography>
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

        {tasks.map(task => {
          const isActive = currentTaskId === task.id;

          return (
            <Stack
              key={task.id}
              direction="row"
              spacing={1.5}
              onClick={() => handleSelect(task.id)}
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
        })}
      </Box>
    </Dialog>
  );
};
