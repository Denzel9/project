import { HelpOutlineOutlined } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useCreatePostMutation,
  useCreateTaskMutation,
  useInstantiateTaskTemplateMutation,
  useMyPostOptionsQuery,
  useTaskTemplatesQuery,
} from '@/entities';
import { useRequireEmailConfirmed } from '@/features';
import { FilterAutocomplete, ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import {
  EXECUTOR_UNASSIGNED_ID,
  useExecutorPickerOptions,
} from '../model/useExecutorPickerOptions';

type AddTaskDialogProps = {
  open: boolean;
  onClose: () => void;
};

const NO_TEMPLATE_ID = 'none';

export const AddTaskDialog = ({ open, onClose }: AddTaskDialogProps) => {
  const [postId, setPostId] = useState<string | null>(null);
  const [executorId, setExecutorId] = useState(EXECUTOR_UNASSIGNED_ID);
  const [templateId, setTemplateId] = useState(NO_TEMPLATE_ID);
  const [tab, setTab] = useState(0);
  const [postTitle, setPostTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [newTaskId, setNewTaskId] = useState<string | undefined>(undefined);
  const [newPostId, setNewPostId] = useState<string | undefined>(undefined);

  const navigate = useNavigate();

  const { setSnackbarOpen } = useSnackbarStore();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  const { data: posts, isLoading: isPostsLoading } = useMyPostOptionsQuery(open);
  const { data: templates = [], isLoading: isTemplatesLoading } =
    useTaskTemplatesQuery({ enabled: open });
  const { options: executorOptions, isLoading: isExecutorsLoading } =
    useExecutorPickerOptions(open);

  const { mutateAsync: createPost, isPending: isCreatingPost } =
    useCreatePostMutation();
  const { mutateAsync: createTask, isPending: isCreatingTask } =
    useCreateTaskMutation();
  const { mutateAsync: instantiateTemplate, isPending: isInstantiating } =
    useInstantiateTaskTemplateMutation();

  const selectedTemplate = useMemo(
    () => templates.find(item => item.id === templateId) ?? null,
    [templates, templateId]
  );

  useEffect(() => {
    if (!open) return;
    if (templateId === NO_TEMPLATE_ID) return;
    if (!templates.some(item => item.id === templateId)) {
      setTemplateId(NO_TEMPLATE_ID);
    }
  }, [open, templateId, templates]);

  const createTaskForPost = async (targetPostId: string) => {
    const resolvedExecutorId =
      executorId === EXECUTOR_UNASSIGNED_ID ? undefined : executorId;

    if (templateId !== NO_TEMPLATE_ID) {
      const task = await instantiateTemplate({
        id: templateId,
        body: {
          postId: targetPostId,
          ...(resolvedExecutorId && { executorId: resolvedExecutorId }),
        },
      });

      return task;
    }

    return createTask({
      postId: targetPostId,
      ...(resolvedExecutorId && { executorId: resolvedExecutorId }),
    });
  };

  const handleCreatePost = async () => {
    if (!requireEmailConfirmed()) return;

    const res = await createPost({
      title: postTitle,
      isPrivate,
    });

    if (res.id) {
      setSnackbarOpen(true, 'Пост успешно создан');
      setTab(0);
      setPostId(res.id);
    }
  };

  const handleCreateTask = async () => {
    if (!postId) return;
    if (!requireEmailConfirmed()) return;

    try {
      const res = await createTaskForPost(postId);

      if (res.id) {
        setSnackbarOpen(true, 'Задача успешно создана');
        setNewTaskId(res.id);
        setNewPostId(res.postId || postId);
      }
    } catch {
      setSnackbarOpen(true, 'Не удалось создать задачу');
    }
  };

  const handleClose = () => {
    onClose();
    setTab(0);
    setPostId(null);
    setExecutorId(EXECUTOR_UNASSIGNED_ID);
    setTemplateId(NO_TEMPLATE_ID);
    setPostTitle('');
    setIsPrivate(false);
    setNewTaskId(undefined);
    setNewPostId(undefined);
  };

  const postOptions = useMemo(
    () =>
      posts?.items.map(post => ({
        id: post.id,
        label: post.title,
      })) ?? [],
    [posts]
  );

  const isPending = isCreatingPost || isCreatingTask || isInstantiating;

  return (
    <Dialog
      open={open}
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
      <Typography
        variant="h6"
        sx={{ mb: 2 }}
      >
        {newTaskId ? 'Задача успешно создана!' : 'Добавить задачу'}
      </Typography>

      {!newTaskId && (
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          sx={{ mb: 3 }}
        >
          <Tab
            label="Имеющийся пост"
            disabled={isPending}
          />
          <Tab
            label="Новый пост"
            disabled={isPending}
          />
        </Tabs>
      )}

      {tab === 0 && !newTaskId && (
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
            label="Шаблон"
            value={templateId}
            disabled={isPending || isTemplatesLoading}
            onChange={event => setTemplateId(event.target.value)}
            helperText={
              selectedTemplate
                ? `Будут применены поля шаблона «${selectedTemplate.name}»`
                : 'Необязательно'
            }
          >
            <MenuItem value={NO_TEMPLATE_ID}>Без шаблона</MenuItem>
            {templates.map(template => (
              <MenuItem
                key={template.id}
                value={template.id}
              >
                {template.name}
              </MenuItem>
            ))}
          </TextField>

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
      )}

      {tab === 1 && !newTaskId && (
        <Stack
          direction="column"
          spacing={2}
          sx={{ alignItems: 'flex-start' }}
        >
          <TextField
            fullWidth
            label="Название поста"
            value={postTitle}
            disabled={isPending}
            onChange={e => setPostTitle(e.target.value)}
          />

          <TextField
            select
            fullWidth
            label="Шаблон"
            value={templateId}
            disabled={isPending || isTemplatesLoading}
            onChange={event => setTemplateId(event.target.value)}
            helperText={
              selectedTemplate
                ? `После создания поста задача будет создана из шаблона «${selectedTemplate.name}»`
                : 'Необязательно — применится при создании задачи'
            }
          >
            <MenuItem value={NO_TEMPLATE_ID}>Без шаблона</MenuItem>
            {templates.map(template => (
              <MenuItem
                key={template.id}
                value={template.id}
              >
                {template.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            fullWidth
            label="Исполнитель"
            value={executorId}
            disabled={isPending || isExecutorsLoading}
            onChange={event => setExecutorId(event.target.value)}
            helperText="Исполнитель будет назначен при создании задачи"
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

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <Checkbox
              checked={isPrivate}
              disabled={isPending}
              onChange={() => setIsPrivate(!isPrivate)}
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
          disabled={isPending}
          onClick={handleClose}
        >
          {newTaskId ? 'Закрыть' : 'Отменить'}
        </Button>

        {!newTaskId && (
          <Button
            variant="contained"
            color="primary"
            loading={isPending}
            disabled={
              isPending || (tab === 1 ? !postTitle.trim() : !postId)
            }
            onClick={() =>
              void (tab === 0 ? handleCreateTask() : handleCreatePost())
            }
          >
            {tab === 0 ? 'Добавить задачу' : 'Создать пост'}
          </Button>
        )}

        {newTaskId && (
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              navigate(
                `${ROUTES.TASK}/${newPostId ?? newTaskId}?taskId=${newTaskId}${
                  executorId !== EXECUTOR_UNASSIGNED_ID
                    ? `&userId=${executorId}`
                    : '&userId=unassigned'
                }`
              )
            }
          >
            Перейти к задаче
          </Button>
        )}
      </Stack>
    </Dialog>
  );
};
