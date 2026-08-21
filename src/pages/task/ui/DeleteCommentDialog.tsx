import { Button, Stack, Typography } from '@mui/material';

import { useDeleteTaskCommentMutation } from '@/entities/task';
import { AppDialog, appDialogActionsSx } from '@/shared';

type DeleteCommentDialogProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  taskId: string | null;
  commentId: string | null;
};

export const DeleteCommentDialog = ({
  open,
  taskId,
  commentId,
  onClose,
  onSuccess,
}: DeleteCommentDialogProps) => {
  const { mutateAsync: deleteComment, isPending } =
    useDeleteTaskCommentMutation();

  const handleDelete = async () => {
    if (!taskId || !commentId || isPending) return;

    await deleteComment({ taskId, commentId });
    onClose();
    onSuccess?.();
  };

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      title="Удалить"
      minWidth={400}
    >
      <Typography
        variant="body1"
        sx={{ mt: 2 }}
      >
        Вы уверены, что хотите удалить комментарий?
      </Typography>

      <Stack
        direction="row"
        sx={appDialogActionsSx}
      >
        <Button
          onClick={onClose}
          disabled={isPending}
        >
          Отменить
        </Button>
        <Button
          onClick={() => void handleDelete()}
          color="error"
          disabled={isPending}
        >
          Удалить
        </Button>
      </Stack>
    </AppDialog>
  );
};
