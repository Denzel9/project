import { Stack, Button } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';

import { type Task, type UpdateTaskDto } from '@/entities';
import { ConfirmDialog, useSnackbarStore } from '@/widgets';

type PendingInviteProps = {
  taskId: string;
  updateTask: ({
    id,
    body,
  }: {
    id: string;
    body: UpdateTaskDto;
  }) => Promise<Task>;
};

export const PendingInvite = ({ taskId, updateTask }: PendingInviteProps) => {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const { setSnackbarOpen } = useSnackbarStore();

  const handleAccept = async () => {
    try {
      await updateTask({
        id: taskId,
        body: { isExecutorApprove: true },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbarOpen?.(true, String(error.response?.data?.message));
      }
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);

    try {
      await updateTask({
        id: taskId,
        body: {
          isExecutorApprove: false,
        },
      });
      setIsRejectDialogOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbarOpen?.(true, String(error.response?.data?.message));
      }
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ mt: 4 }}
    >
      <Button
        size="small"
        color="error"
        variant="outlined"
        onClick={() => setIsRejectDialogOpen(true)}
      >
        Отклонить
      </Button>

      <Button
        size="small"
        variant="outlined"
        onClick={handleAccept}
      >
        Принять
      </Button>

      <ConfirmDialog
        title="Отказаться от задачи"
        description="Вы уверены, что хотите отказаться от участия в задаче?"
        isOpen={isRejectDialogOpen}
        isPending={isRejecting}
        successLabel="Отклонить"
        onSuccess={() => void handleReject()}
        onClose={() => setIsRejectDialogOpen(false)}
      />
    </Stack>
  );
};
