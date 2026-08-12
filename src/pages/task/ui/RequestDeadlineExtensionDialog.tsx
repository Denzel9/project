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
  useRequestTaskDeadlineExtensionMutation,
  type TaskAnnulmentInitiator,
} from '@/entities';
import { formatPostDeadlineForApi } from '@/entities/post';
import { DatePicker } from '@/shared';
import { useSnackbarStore } from '@/widgets';

const INITIATOR_OPTIONS: { value: TaskAnnulmentInitiator; label: string }[] = [
  { value: 'CUSTOMER', label: 'Заказчик' },
  { value: 'EXECUTOR', label: 'Исполнитель' },
  { value: 'MUTUAL', label: 'Договоренность сторон' },
];

type RequestDeadlineExtensionDialogProps = {
  open: boolean;
  taskId?: string;
  taskIds?: string[];
  currentFinalDate?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
};

export const RequestDeadlineExtensionDialog = ({
  open,
  taskId,
  taskIds,
  currentFinalDate,
  onClose,
  onSuccess,
}: RequestDeadlineExtensionDialogProps) => {
  const [reason, setReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [initiator, setInitiator] = useState<TaskAnnulmentInitiator | ''>('');

  const ids = useMemo(
    () => (taskIds?.length ? taskIds : taskId ? [taskId] : []),
    [taskId, taskIds],
  );

  const { setSnackbarOpen } = useSnackbarStore();
  const { mutateAsync: requestDeadlineExtension, isPending } =
    useRequestTaskDeadlineExtensionMutation();

  const handleClose = () => {
    onClose();
    setReason('');
    setNewDate('');
    setInitiator('');
  };

  const handleSubmit = async () => {
    if (!reason.trim() || !newDate || !initiator || ids.length === 0) return;

    const proposedFinalDate = formatPostDeadlineForApi(newDate);
    if (!proposedFinalDate) return;

    if (currentFinalDate) {
      const current = new Date(currentFinalDate).getTime();
      const proposed = new Date(proposedFinalDate).getTime();
      if (!Number.isNaN(current) && proposed <= current) {
        setSnackbarOpen?.(
          true,
          'Новая дата должна быть позже текущего дедлайна',
          'error',
        );
        return;
      }
    }

    try {
      const results = await Promise.allSettled(
        ids.map(id =>
          requestDeadlineExtension({
            id,
            body: {
              reason: reason.trim(),
              initiator,
              proposedFinalDate,
            },
          }),
        ),
      );

      const successCount = results.filter(result => result.status === 'fulfilled').length;
      const failCount = results.length - successCount;

      if (successCount > 0 && failCount === 0) {
        setSnackbarOpen?.(
          true,
          ids.length === 1
            ? 'Запрос на перенос дедлайна отправлен'
            : `Запрос на перенос дедлайна отправлен для ${successCount} задач`,
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
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          width: { xs: '100%', md: 560 },
          maxWidth: { xs: '100%', md: '90%' },
          m: 0,
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
        <Typography variant="h6">
          {ids.length > 1
            ? `Запросить перенос дедлайна (${ids.length})`
            : 'Запросить перенос дедлайна'}
        </Typography>

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

          <DatePicker
            label="Новая дата"
            value={newDate}
            onChange={setNewDate}
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
            disabled={
              !reason.trim() || !newDate || !initiator || isPending || ids.length === 0
            }
            onClick={() => void handleSubmit()}
          >
            Запросить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
