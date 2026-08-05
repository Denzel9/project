import { Close } from '@mui/icons-material';
import {
  Button,
  Dialog,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

export type CreateTaskExecutorOption = {
  id: string;
  label: string;
};

type CreateTaskDialogProps = {
  open: boolean;
  isPending?: boolean;
  initialExecutorId?: string;
  executorOptions: CreateTaskExecutorOption[];
  onClose: () => void;
  onConfirm: (payload: {
    title: string;
    executorId: string | null;
  }) => Promise<void> | void;
};

const UNASSIGNED_ID = 'unassigned';

export const CreateTaskDialog = ({
  open,
  isPending = false,
  initialExecutorId = UNASSIGNED_ID,
  executorOptions,
  onClose,
  onConfirm,
}: CreateTaskDialogProps) => {
  const [title, setTitle] = useState('');
  const [executorId, setExecutorId] = useState(initialExecutorId);

  useEffect(() => {
    if (!open) return;

    setTitle('');
    setExecutorId(initialExecutorId || UNASSIGNED_ID);
  }, [open, initialExecutorId]);

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleConfirm = async () => {
    await onConfirm({
      title: title.trim(),
      executorId: executorId === UNASSIGNED_ID ? null : executorId,
    });
  };

  const options =
    executorOptions.some(option => option.id === UNASSIGNED_ID)
      ? executorOptions
      : [{ id: UNASSIGNED_ID, label: 'Не назначен' }, ...executorOptions];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: '24px', p: { xs: 2, sm: 3 } },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Новая задача</Typography>
        <IconButton
          aria-label="Закрыть"
          disabled={isPending}
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </Stack>

      <Stack spacing={2}>
        <TextField
          autoFocus
          fullWidth
          label="Название задачи"
          placeholder="Например, Съёмка для Reels"
          value={title}
          disabled={isPending}
          onChange={event => setTitle(event.target.value)}
        />

        <TextField
          select
          fullWidth
          label="Исполнитель"
          value={executorId}
          disabled={isPending}
          onChange={event => setExecutorId(event.target.value)}
        >
          {options.map(option => (
            <MenuItem
              key={option.id}
              value={option.id}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 3 }}
      >
        <Button
          variant="outlined"
          color="primary"
          disabled={isPending}
          onClick={handleClose}
        >
          Отменить
        </Button>

        <Button
          variant="contained"
          color="primary"
          loading={isPending}
          disabled={isPending}
          onClick={() => void handleConfirm()}
        >
          Создать
        </Button>
      </Stack>
    </Dialog>
  );
};
