import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  useRequestTaskAnnulmentMutation,
  type TaskAnnulmentInitiator,
} from '@/entities';
import { useSnackbarStore } from '@/widgets';

const INITIATOR_OPTIONS: { value: TaskAnnulmentInitiator; label: string }[] = [
  { value: 'CUSTOMER', label: 'Заказчик' },
  { value: 'EXECUTOR', label: 'Исполнитель' },
  { value: 'MUTUAL', label: 'Договоренность сторон' },
];

type RequestCancelTaskDialogProps = {
  open: boolean;
  taskId: string;
  onClose: () => void;
};

export const RequestCancelTaskDialog = ({
  open,
  taskId,
  onClose,
}: RequestCancelTaskDialogProps) => {
  const [reason, setReason] = useState('');
  const [initiator, setInitiator] = useState<TaskAnnulmentInitiator | ''>('');

  const { setSnackbarOpen } = useSnackbarStore();
  const { mutateAsync: requestAnnulment, isPending } =
    useRequestTaskAnnulmentMutation();

  const handleClose = () => {
    onClose();
    setReason('');
    setInitiator('');
  };

  const handleSubmit = async () => {
    if (!reason.trim() || !initiator) return;

    try {
      await requestAnnulment({
        id: taskId,
        body: { reason: reason.trim(), initiator },
      });
      setSnackbarOpen?.(true, 'Запрос на аннулирование отправлен');
      handleClose();
    } catch {
      setSnackbarOpen?.(
        true,
        'Не удалось отправить запрос. Попробуйте позже',
        'error'
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          width: 560,
          maxWidth: '90%',
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

      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Запросить аннулирование задачи</Typography>

        <Stack
          spacing={2}
          sx={{ mt: 3 }}
        >
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Причина"
            value={reason}
            onChange={e => setReason(e.target.value)}
          />

          <TextField
            select
            fullWidth
            label="Инициатор"
            value={initiator}
            onChange={e =>
              setInitiator(e.target.value as TaskAnnulmentInitiator)
            }
          >
            {INITIATOR_OPTIONS.map(option => (
              <MenuItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4, justifyContent: 'flex-end' }}
        >
          <Button
            onClick={handleClose}
            disabled={isPending}
          >
            Отменить
          </Button>
          <Button
            color="primary"
            variant="contained"
            loading={isPending}
            disabled={!reason.trim() || !initiator || isPending}
            onClick={() => void handleSubmit()}
          >
            Запросить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
