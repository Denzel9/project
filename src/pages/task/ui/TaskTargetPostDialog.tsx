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

export type DuplicateTarget =
  | { target: 'current'; executorId: string | null }
  | { target: 'post'; postId: string; executorId: string | null };

type DuplicateTab = 'current' | 'existing' | 'new';

type TaskTargetPostDialogProps = {
  open: boolean;
  /** Текущий пост задачи — для подписи во вкладке «Текущее объявление» */
  currentPostId?: string | null;
  currentPostTitle?: string | null;
  /** Показать вкладку «Текущее объявление» (по умолчанию — если есть currentPostId) */
  showCurrentTab?: boolean;
  initialExecutorId?: string | null;
  executorOptions: DuplicateTaskExecutorOption[];
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (payload: DuplicateTarget) => Promise<Task | void>;
  onGoToCreatedTask: (task: Task) => void;
};

const UNASSIGNED_ID = 'unassigned';

const TAB_ITEMS: { value: DuplicateTab; label: string }[] = [
  { value: 'current', label: 'Текущее объявление' },
  { value: 'existing', label: 'Имеющийся пост' },
  { value: 'new', label: 'Новый пост' },
];

export const TaskTargetPostDialog = ({
  open,
  currentPostId = null,
  currentPostTitle = null,
  showCurrentTab,
  initialExecutorId = null,
  executorOptions,
  isPending = false,
  onClose,
  onConfirm,
  onGoToCreatedTask,
}: TaskTargetPostDialogProps) => {
  const hasCurrentTab = showCurrentTab ?? Boolean(currentPostId);
  const visibleTabs = useMemo(
    () =>
      TAB_ITEMS.filter(item => item.value !== 'current' || hasCurrentTab),
    [hasCurrentTab]
  );

  const [tab, setTab] = useState<DuplicateTab>(
    hasCurrentTab ? 'current' : 'existing'
  );
  const [postId, setPostId] = useState<string | null>(null);
  const [executorId, setExecutorId] = useState(UNASSIGNED_ID);
  const [postTitle, setPostTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [createdTask, setCreatedTask] = useState<Task | null>(null);

  const { requireEmailConfirmed } = useRequireEmailConfirmed();
  const { mutateAsync: createPost, isPending: isCreatingPost } =
    useCreatePostMutation();

  const isSuccess = Boolean(createdTask);
  const showForm = !isSuccess;

  const { data: posts, isLoading: isPostsLoading } = useMyPostOptionsQuery(
    open && showForm
  );

  const postOptions = useMemo(() => {
    const items = (posts?.items ?? [])
      .filter(post => post.id !== currentPostId)
      .map(post => ({
        id: post.id,
        label: post.title,
      }));

    if (
      postId &&
      postTitle.trim() &&
      !items.some(item => item.id === postId)
    ) {
      return [{ id: postId, label: postTitle.trim() }, ...items];
    }

    return items;
  }, [posts, currentPostId, postId, postTitle]);

  const resolvedExecutorOptions = useMemo(() => {
    const base = executorOptions.some(option => option.id === UNASSIGNED_ID)
      ? executorOptions
      : [{ id: UNASSIGNED_ID, label: 'Не назначен' }, ...executorOptions];

    return base;
  }, [executorOptions]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setTab(hasCurrentTab ? 'current' : 'existing');
        setPostId(null);
        setExecutorId(UNASSIGNED_ID);
        setPostTitle('');
        setIsPrivate(false);
        setCreatedTask(null);
      }, 0);
      return;
    }

    setTimeout(() => {
      setTab(hasCurrentTab ? 'current' : 'existing');
      setPostId(null);
      setExecutorId(initialExecutorId || UNASSIGNED_ID);
      setPostTitle('');
      setIsPrivate(false);
      setCreatedTask(null);
    }, 0);
  }, [open, hasCurrentTab, initialExecutorId]);

  const busy = isPending || isCreatingPost;

  const handleClose = () => {
    if (busy) return;
    onClose();
    setTab(hasCurrentTab ? 'current' : 'existing');
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
        setTab('existing');
      }
    } catch {
      // Ошибка обрабатывается глобально / остаёмся на форме
    }
  };

  const handleConfirm = async () => {
    if (!requireEmailConfirmed()) return;

    try {
      let result: Task | void;

      if (tab === 'current') {
        result = await onConfirm({
          target: 'current',
          executorId: resolvedExecutorId,
        });
      } else {
        if (!postId) return;
        result = await onConfirm({
          target: 'post',
          postId,
          executorId: resolvedExecutorId,
        });
      }

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

  const canSubmitCurrent = hasCurrentTab && !busy;
  const canSubmitExisting = Boolean(postId) && !busy;
  const canSubmitNewPost = Boolean(postTitle.trim()) && !busy;

  const submitDisabled =
    tab === 'current'
      ? !canSubmitCurrent
      : tab === 'existing'
        ? !canSubmitExisting
        : !canSubmitNewPost;

  const currentLabel =
    currentPostTitle?.trim() || 'Текущее объявление';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            m: 2,
            borderRadius: '24px',
            p: { xs: 2, sm: 3 },
            width: { xs: '100%', md: 560 },
          },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">
          {isSuccess ? 'Задача успешно дублирована' : 'Дублировать задачу'}
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
            onChange={(_, value: DuplicateTab) => setTab(value)}
            variant="scrollable"
            sx={{ mb: 3 }}
          >
            {visibleTabs.map(item => (
              <Tab
                key={item.value}
                value={item.value}
                label={item.label}
                disabled={busy}
              />
            ))}
          </Tabs>

          {tab === 'current' && (
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Объявление"
                value={currentLabel}
                disabled
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

          {tab === 'existing' && (
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

          {tab === 'new' && (
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
              disabled={submitDisabled}
              onClick={() =>
                void (tab === 'new' ? handleCreatePost() : handleConfirm())
              }
            >
              {tab === 'new' ? 'Создать пост' : 'Дублировать'}
            </Button>
          </Stack>
        </>
      )}
    </Dialog>
  );
};
