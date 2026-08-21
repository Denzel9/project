import { Button, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

import { AppDialog, appDialogActionsSx } from '@/shared';

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
    <AppDialog
      open={open}
      onClose={handleClose}
      title="Откликнуться"
    >
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
        sx={appDialogActionsSx}
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
    </AppDialog>
  );
};
