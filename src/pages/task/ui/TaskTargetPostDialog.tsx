import { Close, HelpOutlineOutlined } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  IconButton,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useCreatePostMutation, useMyPostOptionsQuery, type Task } from '@/entities';
import { useRequireEmailConfirmed } from '@/features';
import { FilterAutocomplete } from '@/shared';

export type DuplicateTaskExecutorOption = {
  id: string;
  label: string;
};

type TaskTargetPostMode = 'duplicate' | 'duplicate-same';

type TaskTargetPostDialogProps = {
  open: boolean;
  mode: TaskTargetPostMode;
  /** Для duplicate-same — пост, в который дублируем по умолчанию */
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
  const [tab, setTab] = useState(0);
  const [postId, setPostId] = useState<string | null>(null);
  const [executorId, setExecutorId] = useState(UNASSIGNED_ID);
  const [postTitle, setPostTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [createdTask, setCreatedTask] = useState<Task | null>(null);

  const { requireEmailConfirmed } = useRequireEmailConfirmed();
  const { mutateAsync: createPost, isPending: isCreatingPost } =
    useCreatePostMutation();

  const isSamePost = mode === 'duplicate-same';
  const isSuccess = Boolean(createdTask);
  const showForm = !isSuccess;

  const { data: posts, isLoading: isPostsLoading } = useMyPostOptionsQuery(
    open && showForm
  );

  const postOptions = useMemo(() => {
    const items = (posts?.items ?? [])
      .filter(post => post.id !== excludePostId)
      .map(post => ({
        id: post.id,
        label: post.title,
      }));

    // После создания нового поста он может ещё не попасть в список — добавляем вручную
    if (
      postId &&
      postTitle.trim() &&
      !items.some(item => item.id === postId)
    ) {
      return [{ id: postId, label: postTitle.trim() }, ...items];
    }

    return items;
  }, [posts, excludePostId, postId, postTitle]);

  const resolvedExecutorOptions = useMemo(() => {
    const base = executorOptions.some(option => option.id === UNASSIGNED_ID)
      ? executorOptions
      : [{ id: UNASSIGNED_ID, label: 'Не назначен' }, ...executorOptions];

    return base;
  }, [executorOptions]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setTab(0);
        setPostId(null);
        setExecutorId(UNASSIGNED_ID);
        setPostTitle('');
        setIsPrivate(false);
        setCreatedTask(null);
      }, 0);
      return;
    }

    setTimeout(() => {
      setTab(0);
      setPostId(isSamePost ? fixedPostId : null);
      setExecutorId(initialExecutorId || UNASSIGNED_ID);
      setPostTitle('');
      setIsPrivate(false);
      setCreatedTask(null);
    }, 0);
  }, [open, isSamePost, fixedPostId, initialExecutorId]);

  const busy = isPending || isCreatingPost;

  const handleClose = () => {
    if (busy) return;
    onClose();
    setTab(0);
    setPostId(null);
    setExecutorId(UNASSIGNED_ID);
    setPostTitle('');
    setIsPrivate(false);
    setCreatedTask(null);
  };

  const resolvedExecutorId =
    executorId === UNASSIGNED_ID ? null : executorId;

  const handleCreatePost = async () => {
    if (!postTitle.trim()) return;
    if (!requireEmailConfirmed()) return;

    try {
      const created = await createPost({
        title: postTitle.trim(),
        isPrivate,
      });

      if (created.id) {
        setPostId(created.id);
        setTab(0);
      }
    } catch {
      // Ошибка обрабатывается глобально / остаёмся на форме
    }
  };

  const handleConfirm = async () => {
    if (!postId) return;
    if (!requireEmailConfirmed()) return;

    try {
      const result = await onConfirm({
        postId,
        executorId: resolvedExecutorId,
      });

      if (result) {
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

  const canSubmitExisting = Boolean(postId) && !busy;
  const canSubmitNewPost = Boolean(postTitle.trim()) && !busy;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { borderRadius: '24px', p: { xs: 2, sm: 3 }, m: 0, width: { xs: '100%', md: 560 }, maxWidth: { xs: '100%', md: '90%' } },

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
          disabled={busy}
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
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            sx={{ mb: 3 }}
          >
            <Tab
              label="Имеющийся пост"
              disabled={busy}
            />
            <Tab
              label="Новый пост"
              disabled={busy}
            />
          </Tabs>

          {tab === 0 && (
            <Stack spacing={2}>
              <FilterAutocomplete
                label="Объявление"
                value={postId ?? 'all'}
                options={postOptions}
                loading={isPostsLoading}
                placeholder="Выберите объявление"
                onChange={id => setPostId(id === 'all' ? null : id)}
              />

              <TextField
                select
                fullWidth
                label="Исполнитель"
                value={executorId}
                disabled={busy}
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
          )}

          {tab === 1 && (
            <Stack
              direction="column"
              spacing={2}
              sx={{ alignItems: 'flex-start' }}
            >
              <TextField
                fullWidth
                label="Название поста"
                value={postTitle}
                disabled={busy}
                onChange={event => setPostTitle(event.target.value)}
              />

              <TextField
                select
                fullWidth
                label="Исполнитель"
                value={executorId}
                disabled={busy}
                onChange={event => setExecutorId(event.target.value)}
                helperText="Исполнитель будет назначен при дублировании задачи"
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

              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center' }}
              >
                <Checkbox
                  checked={isPrivate}
                  disabled={busy}
                  onChange={() => setIsPrivate(prev => !prev)}
                />
                <Typography
                  variant="body1"
                  color="text.secondary"
                >
                  Приватный пост
                </Typography>

                <Tooltip title="Пост будет виден только вам. Нужен для создания задач на частные проекты.">
                  <HelpOutlineOutlined color="info" />
                </Tooltip>
              </Stack>
            </Stack>
          )}

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              color="primary"
              disabled={busy}
              onClick={handleClose}
            >
              Отменить
            </Button>

            <Button
              variant="contained"
              color="primary"
              loading={busy}
              disabled={tab === 0 ? !canSubmitExisting : !canSubmitNewPost}
              onClick={() =>
                void (tab === 0 ? handleConfirm() : handleCreatePost())
              }
            >
              {tab === 0 ? CONFIRM_LABELS[mode] : 'Создать пост'}
            </Button>
          </Stack>
        </>
      )}
    </Dialog>
  );
};
