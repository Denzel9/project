import { QuestionMark } from '@mui/icons-material';
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
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useCreatePostMutation,
  useCreateTaskMutation,
  usePostsQuery,
} from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

type AddTaskDialogProps = {
  open: boolean;
  onClose: () => void;
};

export const AddTaskDialog = ({ open, onClose }: AddTaskDialogProps) => {
  const [postId, setPostId] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [postTitle, setPostTitle] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [newTaskId, setNewTaskId] = useState<string | undefined>(undefined);

  const navigate = useNavigate();

  const { id } = useAuthStore();

  const { setSnackbarOpen } = useSnackbarStore();

  const { data: posts } = usePostsQuery({ ownerId: id ?? '' });

  const { mutateAsync: createPost } = useCreatePostMutation();
  const { mutateAsync: createTask } = useCreateTaskMutation();

  const handleCreatePost = async () => {
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

    const res = await createTask({
      postId,
    });

    if (res.id) {
      setSnackbarOpen(true, 'Задача успешно создана');
      setNewTaskId(res.id);
    }
  };

  const handleClose = () => {
    onClose();
    setTab(0);
    setPostId(null);
    setPostTitle('');
    setIsPrivate(false);
    setNewTaskId(undefined);
  };

  const postOptions = useMemo(() => {
    return posts?.items.map(post => ({
      id: post.id,
      label: post.title,
    }));
  }, [posts]);

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
          <Tab label="Имеющийся пост" />
          <Tab label="Новый пост" />
        </Tabs>
      )}

      {tab === 0 && !newTaskId && (
        <TextField
          select
          fullWidth
          value={postId}
          label="Объявление"
          onChange={e => setPostId(e.target.value)}
        >
          {postOptions?.map(post => (
            <MenuItem
              key={post.id}
              value={post.id}
            >
              {post.label}
            </MenuItem>
          ))}
        </TextField>
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
            onChange={e => setPostTitle(e.target.value)}
          />

          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <Checkbox
              checked={isPrivate}
              onChange={() => setIsPrivate(!isPrivate)}
            />
            <Typography
              variant="body1"
              color="text.secondary"
            >
              Приватный пост
            </Typography>

            <Tooltip title="Пост будет виден только вам. Нужен для создания задач на частные проекты.">
              <QuestionMark color="primary" />
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
          onClick={onClose}
        >
          {newTaskId ? 'Закрыть' : 'Отменить'}
        </Button>

        {!newTaskId && (
          <Button
            variant="contained"
            color="primary"
            onClick={tab === 0 ? handleCreateTask : handleCreatePost}
            disabled={(!postTitle && tab === 1) || (!postId && tab === 0)}
          >
            Добавить задачу
          </Button>
        )}

        {newTaskId && (
          <Button
            variant="contained"
            color="primary"
            onClick={() =>
              navigate(
                `${ROUTES.TASK}/${newTaskId}?taskId=${newTaskId}&inviteId=${newTaskId}`
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
