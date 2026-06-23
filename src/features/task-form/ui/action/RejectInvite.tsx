import { Button, Stack, Typography } from '@mui/material';

import { type UpdateTaskDto, type Task, TASK_STATUS_ENUM } from '@/entities';

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
  const handleAccept = async () => {
    await updateTask({
      id: taskId,
      body: { isExecutorApprove: null, status: TASK_STATUS_ENUM.PREPARING },
    });
  };

  return (
    <Stack
      spacing={2}
      sx={{ mt: 4, alignItems: 'start' }}
      direction="column"
    >
      <Typography>
        {isMe
          ? 'Исполнитель отклонил приглашение на выполнение задачи.'
          : 'Вы не можете принять участие в задаче, так как вы отклонили приглашение.'}
      </Typography>

      {isMe && (
        <Button
          size="small"
          variant="outlined"
          onClick={handleAccept}
        >
          Отправить повторно
        </Button>
      )}
    </Stack>
  );
};
