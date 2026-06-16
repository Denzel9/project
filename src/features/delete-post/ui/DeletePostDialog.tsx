import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import { useDeletePostMutation } from '@/entities/post';

type DeletePostDialogProps = {
  open: boolean;
  postId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export const DeletePostDialog = ({
  open,
  postId,
  onClose,
  onSuccess,
}: DeletePostDialogProps) => {
  const { mutateAsync: deletePost, isPending } = useDeletePostMutation();

  const handleDelete = async () => {
    if (!postId || isPending) return;

    await deletePost(postId);
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
          Вы уверены, что хотите удалить это объявление?
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
