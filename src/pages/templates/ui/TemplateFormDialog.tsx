import { yupResolver } from '@hookform/resolvers/yup';
import { Close } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { TASK_STATUS_ENUM, type CreateTaskTemplateDto, type TaskTemplate } from '@/entities';
import {
  defaultValues,
  schema,
  type TaskFormType,
} from '@/features/task-form/model/schema/schema';
import { TaskFormFields } from '@/features/task-form/ui/TaskFormFields';

import {
  mapFormToTaskTemplateBody,
  mapTaskTemplateToForm,
} from '../model/mappers';

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
  const [urgent, setUrgent] = useState(false);

  const methods = useForm<TaskFormType>({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      setName(initial?.name ?? '');
      setUrgent(initial?.urgent ?? false);
      methods.reset(mapTaskTemplateToForm(initial));
    }, 0);
  }, [open, initial, methods]);

  const canSubmit = name.trim().length > 0 && !isPending;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSubmit = methods.handleSubmit(async values => {
    if (!canSubmit) return;

    await onSubmit(mapFormToTaskTemplateBody(name.trim(), values, urgent));
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            m: 0,
            p: { xs: 1, sm: 2 },
            width: { xs: '100%', md: 720 },
            borderRadius: { xs: 0, md: '24px' },
            maxWidth: { xs: '100%', md: '90%' },
            maxHeight: { xs: '100%', sm: '90vh' },
          },
        },
      }}
    >
      <FormProvider {...methods}>
        <Stack
          direction="row"
          sx={{
            px: { xs: 1, sm: 2 },
            pt: { xs: 1, sm: 1 },
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
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

        <DialogContent sx={{ px: { xs: 1, sm: 2 }, pb: 1 }}>
          <Stack spacing={3}>
            <TextField
              required
              label="Название шаблона"
              value={name}
              onChange={event => setName(event.target.value)}
              fullWidth
              disabled={isPending}
            />

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

            <TaskFormFields
              isMe
              isEdit
              status={TASK_STATUS_ENUM.PREPARING}
              onStartEdit={() => undefined}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
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
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
