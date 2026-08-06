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
import { useEffect, useMemo, useState } from 'react';

import { useMyPostOptionsQuery, type Task } from '@/entities';
import { FilterAutocomplete } from '@/shared';

export type DuplicateTaskExecutorOption = {
  id: string;
  label: string;
};

type TaskTargetPostMode = 'duplicate' | 'duplicate-same';

type TaskTargetPostDialogProps = {
  open: boolean;
  mode: TaskTargetPostMode;
  /** Для duplicate-same — пост, в который дублируем */
  fixedPostId?: string | null;
  excludePostId?: string | null;
  initialExecutorId?: string | null;
  executorOptions: DuplicateTaskExecutorOption[];
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    postId: string;
    executorId: string | null;
  }) => Promise<Task | void>;
  onGoToCreatedTask: (task: Task) => void;
};

const TITLES: Record<TaskTargetPostMode, string> = {
  duplicate: 'Дублировать в другой пост',
  'duplicate-same': 'Дублировать задачу',
};

const CONFIRM_LABELS: Record<TaskTargetPostMode, string> = {
  duplicate: 'Дублировать',
  'duplicate-same': 'Дублировать',
};

const UNASSIGNED_ID = 'unassigned';

export const TaskTargetPostDialog = ({
  open,
  mode,
  fixedPostId = null,
  excludePostId,
  initialExecutorId = null,
  executorOptions,
  isPending = false,
  onClose,
  onConfirm,
  onGoToCreatedTask,
}: TaskTargetPostDialogProps) => {
  const [postId, setPostId] = useState<string | null>(null);
  const [executorId, setExecutorId] = useState(UNASSIGNED_ID);
  const [createdTask, setCreatedTask] = useState<Task | null>(null);

  const isSamePost = mode === 'duplicate-same';
  const isSuccess = Boolean(createdTask) && !isSamePost;
  const showPostPicker = !isSamePost && !isSuccess;

  const { data: posts, isLoading: isPostsLoading } = useMyPostOptionsQuery(
    open && showPostPicker
  );

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

  const resolvedExecutorOptions = useMemo(() => {
    const base = executorOptions.some(option => option.id === UNASSIGNED_ID)
      ? executorOptions
      : [{ id: UNASSIGNED_ID, label: 'Не назначен' }, ...executorOptions];

    return base;
  }, [executorOptions]);

  useEffect(() => {
    if (!open) {
      setPostId(null);
      setExecutorId(UNASSIGNED_ID);
      setCreatedTask(null);
      return;
    }

    setPostId(isSamePost ? fixedPostId : null);
    setExecutorId(initialExecutorId || UNASSIGNED_ID);
    setCreatedTask(null);
  }, [open, isSamePost, fixedPostId, initialExecutorId]);

  const handleClose = () => {
    if (isPending) return;
    onClose();
    setPostId(null);
    setExecutorId(UNASSIGNED_ID);
    setCreatedTask(null);
  };

  const handleConfirm = async () => {
    const targetPostId = isSamePost ? fixedPostId : postId;
    if (!targetPostId) return;

    try {
      const result = await onConfirm({
        postId: targetPostId,
        executorId: executorId === UNASSIGNED_ID ? null : executorId,
      });

      if (result && !isSamePost) {
        setCreatedTask(result);
        return;
      }

      handleClose();
    } catch {
      // Ошибка обрабатывается снаружи, модалка остаётся открытой
    }
  };

  const handleGoToCreatedTask = () => {
    if (!createdTask) return;
    onGoToCreatedTask(createdTask);
    handleClose();
  };

  const canSubmit = Boolean(isSamePost ? fixedPostId : postId) && !isPending;

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
        <Typography variant="h6">
          {isSuccess ? 'Задача успешно дублирована' : TITLES[mode]}
        </Typography>
        <IconButton
          aria-label="Закрыть"
          disabled={isPending}
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </Stack>

      {isSuccess ? (
        <>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            Перейти к созданной задаче?
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={handleClose}
            >
              Закрыть
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleGoToCreatedTask}
            >
              Перейти
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <Stack spacing={2}>
            {showPostPicker && (
              <FilterAutocomplete
                label="Объявление"
                value={postId ?? 'all'}
                options={postOptions}
                loading={isPostsLoading}
                placeholder="Выберите объявление"
                onChange={id => setPostId(id === 'all' ? null : id)}
              />
            )}

            <TextField
              select
              fullWidth
              label="Исполнитель"
              value={executorId}
              disabled={isPending}
              onChange={event => setExecutorId(event.target.value)}
            >
              {resolvedExecutorOptions.map(option => (
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
              disabled={!canSubmit}
              onClick={() => void handleConfirm()}
            >
              {CONFIRM_LABELS[mode]}
            </Button>
          </Stack>
        </>
      )}
    </Dialog>
  );
};
