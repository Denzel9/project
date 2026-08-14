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
import { useMemo, useState } from 'react';

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
  taskId?: string;
  taskIds?: string[];
  onClose: () => void;
  onSuccess?: () => void;
};

export const RequestCancelTaskDialog = ({
  open,
  taskId,
  taskIds,
  onClose,
  onSuccess,
}: RequestCancelTaskDialogProps) => {
  const [reason, setReason] = useState('');
  const [initiator, setInitiator] = useState<TaskAnnulmentInitiator | ''>('');

  const ids = useMemo(
    () => (taskIds?.length ? taskIds : taskId ? [taskId] : []),
    [taskId, taskIds],
  );

  const { setSnackbarOpen } = useSnackbarStore();
  const { mutateAsync: requestAnnulment, isPending } =
    useRequestTaskAnnulmentMutation();

  const handleClose = () => {
    onClose();
    setReason('');
    setInitiator('');
  };

  const handleSubmit = async () => {
    if (!reason.trim() || !initiator || ids.length === 0) return;

    try {
      const results = await Promise.allSettled(
        ids.map(id =>
          requestAnnulment({
            id,
            body: { reason: reason.trim(), initiator },
          }),
        ),
      );

      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (successCount > 0 && failCount === 0) {
        setSnackbarOpen?.(
          true,
          ids.length === 1
            ? 'Запрос на аннулирование отправлен'
            : `Запрос на аннулирование отправлен для ${successCount} задач`,
        );
        onSuccess?.();
        handleClose();
        return;
      }

      if (successCount > 0) {
        setSnackbarOpen?.(
          true,
          `Отправлено: ${successCount}, не удалось: ${failCount}`,
          'error',
        );
        onSuccess?.();
        handleClose();
        return;
      }

      setSnackbarOpen?.(
        true,
        'Не удалось отправить запрос. Попробуйте позже',
        'error',
      );
    } catch {
      setSnackbarOpen?.(
        true,
        'Не удалось отправить запрос. Попробуйте позже',
        'error',
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '32px',
          width: { xs: '100%', md: 560 },
          m: 2,
        },
      }}
    >


      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'start', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {ids.length > 1
              ? `Запросить аннулирование (${ids.length})`
              : 'Запросить аннулирование задачи'}
          </Typography>
          <IconButton
            onClick={handleClose}
          >
            <Close />
          </IconButton>
        </Stack>


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
            disabled={!reason.trim() || !initiator || isPending || ids.length === 0}
            onClick={() => void handleSubmit()}
          >
            Запросить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
