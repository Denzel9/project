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

import { useApplicationItemStore } from '../model/store';

export const DeleteDialog = () => {
  const { isOpenDeleteDialog, id, setOpenDeleteDialog } =
    useApplicationItemStore();

  const { mutateAsync: deletePost } = useDeletePostMutation();

  const handleDelete = async () => {
    if (!id) return;

    await deletePost(id);
    setOpenDeleteDialog(false, null);
  };

  return (
    <Dialog
      open={isOpenDeleteDialog}
      onClose={() => setOpenDeleteDialog(false, null)}
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
        onClick={() => setOpenDeleteDialog(false, null)}
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
          <Button onClick={() => setOpenDeleteDialog(false, null)}>
            Отменить
          </Button>
          <Button
            onClick={() => handleDelete()}
            color="error"
          >
            Удалить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
