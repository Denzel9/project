import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type ApplyDialogProps = {
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
};

export const ApplyDialog = ({
  open,
  isPending = false,
  onClose,
  onSubmit,
}: ApplyDialogProps) => {
  const [message, setMessage] = useState('');

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = message.trim();

    if (!trimmed) return;

    onSubmit(trimmed);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: '90%',
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          minWidth: { xs: 'auto', md: 560 },
        },
      }}
    >
      <IconButton
        onClick={handleClose}
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

      <Box sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h6">Откликнуться</Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Напишите сообщение автору поста
        </Typography>

        <TextField
          multiline
          minRows={4}
          fullWidth
          value={message}
          disabled={isPending}
          placeholder="Готов обсудить сотрудничество..."
          sx={{ mt: 3 }}
          onChange={e => setMessage(e.target.value)}
        />

        <Stack
          direction="row"
          sx={{ mt: 4, justifyContent: 'flex-end', gap: 1 }}
        >
          <Button
            disabled={isPending}
            onClick={handleClose}
          >
            Отменить
          </Button>
          <Button
            variant="contained"
            disabled={isPending || !message.trim()}
            onClick={handleSubmit}
            loading={isPending}
          >
            Отправить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
