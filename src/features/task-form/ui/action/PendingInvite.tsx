import { Stack, Button, Typography } from '@mui/material';
import { useState } from 'react';

import { TASK_STATUS_ENUM, type Task, type UpdateTaskDto } from '@/entities';
import { ConfirmDialog } from '@/widgets';

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
  const [isOpenAcceptDialog, setIsOpenAcceptDialog] = useState(false);

  const handleAccept = async () => {
    await updateTask({
      id: taskId,
      body: { isExecutorApprove: true },
    });
  };

  const handleReject = async () => {
    await updateTask({
      id: taskId,
      body: {
        isExecutorApprove: false,
        status: TASK_STATUS_ENUM.CANCELLED_EXECUTOR,
      },
    });
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
        onClick={handleReject}
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
        title="Отклонить задачу"
        onSuccess={() => {}}
        isOpen={isOpenAcceptDialog}
        onClose={() => setIsOpenAcceptDialog(false)}
      >
        <Typography>Вы точно хотите отклонить приглашение?</Typography>
      </ConfirmDialog>
    </Stack>
  );
};
