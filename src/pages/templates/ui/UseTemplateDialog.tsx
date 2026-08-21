import { Button, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useMyPostOptionsQuery, type TaskTemplate } from '@/entities';
import {
  EXECUTOR_UNASSIGNED_ID,
  useExecutorPickerOptions,
} from '@/features/task-filter/model/useExecutorPickerOptions';
import { AppDialog, appDialogActionsSx, FilterAutocomplete } from '@/shared';

type UseTemplateDialogProps = {
  open: boolean;
  template: TaskTemplate | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    postId: string;
    executorId?: string;
  }) => Promise<void> | void;
};

export const UseTemplateDialog = ({
  open,
  template,
  isPending = false,
  onClose,
  onSubmit,
}: UseTemplateDialogProps) => {
  const [postId, setPostId] = useState<string | null>(null);
  const [executorId, setExecutorId] = useState(EXECUTOR_UNASSIGNED_ID);
  const { data: posts, isLoading } = useMyPostOptionsQuery(open);
  const { options: executorOptions, isLoading: isExecutorsLoading } =
    useExecutorPickerOptions(open);

  const options = useMemo(
    () =>
      posts?.items.map(post => ({
        id: post.id,
        label: post.title?.trim() || 'Без названия',
      })) ?? [],
    [posts]
  );

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setPostId(null);
        setExecutorId(EXECUTOR_UNASSIGNED_ID);
      }, 0);
    }
  }, [open]);

  const canSubmit = Boolean(postId) && !isPending;

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleSubmit = () => {
    if (!postId) return;

    void onSubmit({
      postId,
      ...(executorId !== EXECUTOR_UNASSIGNED_ID && { executorId }),
    });
  };

  return (
    <AppDialog
      open={open}
      onClose={handleClose}
      title="Создать задачу из шаблона"
      width={560}
      fullWidth
    >
      <Stack
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Шаблон: {template?.name}
        </Typography>
        <FilterAutocomplete
          label="Пост"
          value={postId ?? 'all'}
          options={options}
          loading={isLoading}
          placeholder="Выберите пост"
          onChange={id => setPostId(id === 'all' ? null : id)}
        />
        <TextField
          select
          fullWidth
          label="Исполнитель"
          value={executorId}
          disabled={isPending || isExecutorsLoading}
          onChange={event => setExecutorId(event.target.value)}
        >
          {executorOptions.map(option => (
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
        sx={appDialogActionsSx}
      >
        <Button
          variant="outlined"
          color="primary"
          sx={{ px: { xs: 2, md: 'auto' } }}
          disabled={isPending}
          onClick={handleClose}
        >
          Отменить
        </Button>
        <Button
          variant="contained"
          color="primary"
          sx={{ px: { xs: 2, md: 'auto' } }}
          loading={isPending}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Создать задачу
        </Button>
      </Stack>
    </AppDialog>
  );
};
