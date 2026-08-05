import { Close } from '@mui/icons-material';
import {
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { useMyPostOptionsQuery } from '@/entities';
import { FilterAutocomplete } from '@/shared';

type TaskTargetPostMode = 'duplicate';

type TaskTargetPostDialogProps = {
  open: boolean;
  mode: TaskTargetPostMode;
  excludePostId?: string | null;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (postId: string) => Promise<void> | void;
};

const TITLES: Record<TaskTargetPostMode, string> = {
  duplicate: 'Дублировать в другой пост',
};

const CONFIRM_LABELS: Record<TaskTargetPostMode, string> = {
  duplicate: 'Дублировать',
};

export const TaskTargetPostDialog = ({
  open,
  mode,
  excludePostId,
  isPending = false,
  onClose,
  onConfirm,
}: TaskTargetPostDialogProps) => {
  const [postId, setPostId] = useState<string | null>(null);

  const { data: posts, isLoading: isPostsLoading } = useMyPostOptionsQuery(open);

  const postOptions = useMemo(
    () =>
      (posts?.items ?? [])
        .filter(post => post.id !== excludePostId)
        .map(post => ({
          id: post.id,
          label: post.title,
        })),
    [posts, excludePostId]
  );

  const handleClose = () => {
    if (isPending) return;
    onClose();
    setPostId(null);
  };

  const handleConfirm = async () => {
    if (!postId) return;
    await onConfirm(postId);
    setPostId(null);
  };

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
        <Typography variant="h6">{TITLES[mode]}</Typography>
        <IconButton
          aria-label="Закрыть"
          disabled={isPending}
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </Stack>

      <FilterAutocomplete
        label="Объявление"
        value={postId ?? 'all'}
        options={postOptions}
        loading={isPostsLoading}
        placeholder="Выберите объявление"
        onChange={id => setPostId(id === 'all' ? null : id)}
      />

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
          disabled={!postId || isPending}
          onClick={() => void handleConfirm()}
        >
          {CONFIRM_LABELS[mode]}
        </Button>
      </Stack>
    </Dialog>
  );
};
