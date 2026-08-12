import { Close } from '@mui/icons-material';
import {
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useMyPostOptionsQuery, type TaskTemplate } from '@/entities';
import { FilterAutocomplete } from '@/shared';

type UseTemplateDialogProps = {
  open: boolean;
  template: TaskTemplate | null;
  isPending?: boolean;
  onClose: () => void;
  onSubmit: (postId: string) => Promise<void> | void;
};

export const UseTemplateDialog = ({
  open,
  template,
  isPending = false,
  onClose,
  onSubmit,
}: UseTemplateDialogProps) => {
  const [postId, setPostId] = useState<string | null>(null);
  const { data: posts, isLoading } = useMyPostOptionsQuery(open);

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
      setPostId(null);
    }
  }, [open]);

  const canSubmit = Boolean(postId) && !isPending;

  const handleClose = () => {
    if (isPending) return;
    onClose();
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
        <Typography variant="h6">Создать задачу из шаблона</Typography>
        <IconButton
          aria-label="Закрыть"
          disabled={isPending}
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </Stack>

      <Stack spacing={2}>
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
          onClick={() => {
            if (!postId) return;
            void onSubmit(postId);
          }}
        >
          Создать задачу
        </Button>
      </Stack>
    </Dialog>
  );
};
