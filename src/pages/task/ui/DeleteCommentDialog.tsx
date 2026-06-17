import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { useDeleteTaskCommentMutation } from '@/entities/task';

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
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        color="primary"
        sx={{
          top: 0,
          right: -60,
          position: 'absolute',
          bgcolor: 'secondary.main',
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Удалить</Typography>

        <Typography
          variant="body1"
          sx={{ mt: 2 }}
        >
          Вы уверены, что хотите удалить комментарий?
        </Typography>

        <Stack
          direction="row"
          sx={{ mt: 4, justifyContent: 'flex-end' }}
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
      </Box>
    </Dialog>
  );
};
