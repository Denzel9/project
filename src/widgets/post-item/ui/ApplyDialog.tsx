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
  onSubmit: (payload: { message: string }) => void;
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

    onSubmit({ message: trimmed });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          maxWidth: '90%',
          maxHeight: '90%',
          outline: 'none',
          overflow: 'hidden',
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
          sx={{ mt: 1 }}
          variant="body2"
          color="text.secondary"
        >
          Напишите сообщение автору обьявления
        </Typography>

        <TextField
          multiline
          fullWidth
          minRows={4}
          maxRows={15}
          sx={{ mt: 3 }}
          value={message}
          disabled={isPending}
          onChange={e => setMessage(e.target.value)}
          placeholder="Готов обсудить сотрудничество..."
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
