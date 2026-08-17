import { Button, Stack } from '@mui/material';
import axios from 'axios';

import { type UpdateTaskDto, type Task, TASK_STATUS_ENUM } from '@/entities';
import { useSnackbarStore } from '@/widgets';

type RejectInviteProps = {
  isMe: boolean;
  taskId: string;
  updateTask: ({
    id,
    body,
  }: {
    id: string;
    body: UpdateTaskDto;
  }) => Promise<Task>;
};

export const RejectInvite = ({
  isMe,
  taskId,
  updateTask,
}: RejectInviteProps) => {
  const { setSnackbarOpen } = useSnackbarStore();

  const handleResend = async () => {
    try {
      await updateTask({
        id: taskId,
        body: { isExecutorApprove: null, status: TASK_STATUS_ENUM.PREPARING },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbarOpen?.(true, String(error.response?.data?.message));
      }
    }
  };

  if (!isMe) {
    return null;
  }

  return (
    <Stack
      spacing={2}
      sx={{ mt: 4, alignItems: 'start' }}
      direction="column"
    >
      <Button
        size="small"
        variant="outlined"
        onClick={handleResend}
      >
        Отправить повторно
      </Button>
    </Stack>
  );
};
