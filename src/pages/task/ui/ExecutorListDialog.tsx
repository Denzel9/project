import { Avatar, Box, Stack, Typography } from '@mui/material';

import { executorToUserPartial, getUserName, type Task } from '@/entities';
import { AppDialog } from '@/shared';

type ExecutorListItem = {
  id: string;
  tasks: Task[];
};

type ExecutorListDialogProps = {
  open: boolean;
  onClose: () => void;
  executors: ExecutorListItem[];
  currentExecutorId?: string;
  onSelectExecutor: (executorKey: string) => void;
};

const getExecutorName = (task?: Task) => {
  if (!task) return 'Не назначен';

  return getUserName(executorToUserPartial(task.executor)) || 'Не назначен';
};

const getExecutorInitials = (task?: Task) =>
  getExecutorName(task)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

export const ExecutorListDialog = ({
  open,
  onClose,
  executors,
  currentExecutorId,
  onSelectExecutor,
}: ExecutorListDialogProps) => {
  const handleSelect = (executorKey: string) => {
    onSelectExecutor(executorKey);
    onClose();
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Все исполнители"
      width={560}
      fullWidth
    >
      <Box
        sx={{
          mt: 2,
          maxHeight: 420,
          overflowY: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          p: 1,
        }}
      >
        {!executors.length && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 3 }}
          >
            Нет исполнителей
          </Typography>
        )}

        <Stack
          spacing={1}
          direction="column"
        >
          {executors.map(({ id, tasks }) => {
            const representative = tasks[0];
            const isActive = currentExecutorId === id;

            return (
              <Stack
                key={id}
                direction="row"
                spacing={1.5}
                onClick={() => handleSelect(id)}
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
                <Avatar
                  src={representative?.executor?.avatar || undefined}
                  sx={{
                    width: 36,
                    height: 36,
                    fontSize: 14,
                    flexShrink: 0,
                    bgcolor: isActive ? 'primary.dark' : 'grey.300',
                  }}
                >
                  {getExecutorInitials(representative)}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body1"
                    noWrap
                    sx={{
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'common.white' : 'text.primary',
                    }}
                  >
                    {getExecutorName(representative)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 0.75,
                    height: 22,
                    minWidth: 22,
                    fontSize: 12,
                    fontWeight: 600,
                    flexShrink: 0,
                    borderRadius: '10px',
                    alignItems: 'center',
                    display: 'inline-flex',
                    justifyContent: 'center',
                    color: isActive ? 'common.white' : 'text.secondary',
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  }}
                >
                  {tasks.length}
                </Box>
              </Stack>
            );
          })}
        </Stack>
      </Box>
    </AppDialog>
  );
};
