import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useMemo, useState } from 'react';

import {
  useRequestTaskAnnulmentMutation,
  type TaskAnnulmentInitiator,
} from '@/entities';
import { AppDialog, appDialogActionsSx } from '@/shared';
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

      const successCount = results.filter(
        result => result.status === 'fulfilled',
      ).length;
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
    <AppDialog
      open={open}
      onClose={handleClose}
      title={
        ids.length > 1
          ? `Запросить аннулирование (${ids.length})`
          : 'Запросить аннулирование задачи'
      }
      width={560}
    >
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
        sx={appDialogActionsSx}
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
    </AppDialog>
  );
};
