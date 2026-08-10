import { Close, HelpOutlineOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type ApplyDialogProps = {
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    message: string;
    attachStatistics: boolean;
  }) => void;
};

export const ApplyDialog = ({
  open,
  isPending = false,
  onClose,
  onSubmit,
}: ApplyDialogProps) => {
  const [message, setMessage] = useState('');
  const [isAttachedStatistic, setIsAttachedStatistic] = useState(true);

  const handleClose = () => {
    setMessage('');
    setIsAttachedStatistic(true);
    onClose();
  };

  const handleSubmit = () => {
    const trimmed = message.trim();

    if (!trimmed) return;

    onSubmit({
      message: trimmed,
      attachStatistics: isAttachedStatistic,
    });
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

        <FormControlLabel
          sx={{ mt: 1 }}
          control={
            <Checkbox
              checked={isAttachedStatistic}
              disabled={isPending}
              onChange={() => setIsAttachedStatistic(!isAttachedStatistic)}
            />
          }
          label={
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <Typography variant="body2">Прикрепить статистику</Typography>
              <Tooltip title="Владелец поста увидит ваши показатели: выполненные и аннулированные работы, совместные задачи и публикации, сколько раз вас добавили в избранное">
                <HelpOutlineOutlined
                  color="info"
                  fontSize="small"
                />
              </Tooltip>
            </Stack>
          }
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
