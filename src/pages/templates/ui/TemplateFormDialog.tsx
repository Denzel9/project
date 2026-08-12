import { Close } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import type { CreateTaskTemplateDto, TaskTemplate } from '@/entities';

type TemplateFormDialogProps = {
  open: boolean;
  initial?: TaskTemplate | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (values: CreateTaskTemplateDto) => Promise<void> | void;
};

export const TemplateFormDialog = ({
  open,
  initial,
  isPending = false,
  onClose,
  onSubmit,
}: TemplateFormDialogProps) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photoCount, setPhotoCount] = useState('0');
  const [videoCount, setVideoCount] = useState('0');
  const [urgent, setUrgent] = useState(false);

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      setName(initial?.name ?? '');
      setTitle(initial?.title ?? '');
      setDescription(initial?.description ?? '');
      setPhotoCount(initial?.photoCount ?? '0');
      setVideoCount(initial?.videoCount ?? '0');
      setUrgent(initial?.urgent ?? false);
    }, 0);
  }, [open, initial]);

  const canSubmit = name.trim().length > 0 && !isPending;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    await onSubmit({
      name: name.trim(),
      title: title.trim() || null,
      description,
      photoCount,
      videoCount,
      urgent,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: { xs: 2, sm: 3 },
            m: 0,
            width: { xs: '100%', md: 560 },
            maxWidth: { xs: '100%', md: '90%' },
          },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">
          {initial ? 'Редактировать шаблон' : 'Новый шаблон'}
        </Typography>
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
          required
          label="Название шаблона"
          value={name}
          onChange={event => setName(event.target.value)}
          fullWidth
          disabled={isPending}
        />
        <TextField
          label="Название задачи"
          value={title}
          onChange={event => setTitle(event.target.value)}
          fullWidth
          disabled={isPending}
        />
        <TextField
          label="Описание"
          value={description}
          onChange={event => setDescription(event.target.value)}
          fullWidth
          multiline
          minRows={3}
          disabled={isPending}
        />
        <Stack
          direction="row"
          spacing={2}
        >
          <TextField
            label="Фото"
            value={photoCount}
            onChange={event => setPhotoCount(event.target.value)}
            fullWidth
            disabled={isPending}
          />
          <TextField
            label="Видео"
            value={videoCount}
            onChange={event => setVideoCount(event.target.value)}
            fullWidth
            disabled={isPending}
          />
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <Checkbox
            checked={urgent}
            disabled={isPending}
            onChange={event => setUrgent(event.target.checked)}
          />
          <Typography
            variant="body1"
            color="text.secondary"
          >
            Срочная
          </Typography>
        </Stack>
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
          disabled={!canSubmit}
          onClick={() => void handleSubmit()}
        >
          {initial ? 'Сохранить' : 'Создать'}
        </Button>
      </Stack>
    </Dialog>
  );
};
