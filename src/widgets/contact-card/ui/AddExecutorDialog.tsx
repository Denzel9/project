import {
  Button,
  Dialog,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { useConversationsQuery, useUpdateTaskMutation } from '@/entities';
import { useSnackbarStore } from '@/widgets';

type AddExecutorDialogProps = {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const AddExecutorDialog = ({
  taskId,
  isOpen,
  onClose,
}: AddExecutorDialogProps) => {
  const [executorId, setExecutorId] = useState<string | null>(null);
  const { mutateAsync: updateTask } = useUpdateTaskMutation();

  const { data: conversations } = useConversationsQuery();
  const { setSnackbarOpen } = useSnackbarStore();

  const conversationOptions = useMemo(() => {
    return conversations?.map(({ peer }) => ({
      id: peer.id,
      label: peer.displayName,
    }));
  }, [conversations]);

  const handleAddExecutor = async () => {
    if (!executorId) return;

    const res = await updateTask({
      id: taskId,
      body: { executorId: executorId },
    });
    if (res.id) {
      setSnackbarOpen(true, 'Исполнитель успешно добавлен');
      handleClose();
      return;
    }

    setSnackbarOpen(true, 'Не удалось добавить исполнителя');
  };

  const handleClose = () => {
    setExecutorId(null);
    onClose();
  };
  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      sx={{
        p: 4,
        '& .MuiDialog-paper': {
          borderRadius: '32px',
          maxWidth: '90%',
          minWidth: '560px',
          padding: '24px',
        },
      }}
    >
      <Typography variant="h6">Добавить исполнителя</Typography>

      <TextField
        select
        fullWidth
        sx={{ mt: 4 }}
        label="Пользователь"
        value={executorId}
        onChange={e => setExecutorId(e.target.value)}
      >
        {conversationOptions?.map(option => (
          <MenuItem
            key={option.id}
            value={option.id}
          >
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 3 }}
      >
        <Button
          variant="outlined"
          color="primary"
          onClick={onClose}
        >
          Отменить
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={handleAddExecutor}
        >
          Добавить исполнителя
        </Button>
      </Stack>
    </Dialog>
  );
};
