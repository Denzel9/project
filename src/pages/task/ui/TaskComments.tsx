import { Delete, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  canManageComment,
  useCreateTaskCommentMutation,
  useDeleteTaskCommentMutation,
  useUpdateTaskCommentMutation,
  type Task,
} from '@/entities/task';
import { useAuthStore } from '@/features/auth';

type TaskCommentsProps = {
  task: Task;
};

export const TaskComments = ({ task }: TaskCommentsProps) => {
  const currentUserId = useAuthStore(state => state.id);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { mutate: createComment, isPending: isCreating } =
    useCreateTaskCommentMutation();
  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateTaskCommentMutation();
  const { mutate: deleteComment, isPending: isDeleting } =
    useDeleteTaskCommentMutation();

  const comments = task.comments ?? [];
  const isPending = isCreating || isUpdating || isDeleting;

  const handleCreate = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    createComment(
      { taskId: task.id, body: { content: trimmed } },
      { onSuccess: () => setContent('') }
    );
  };

  const handleStartEdit = (commentId: string, text: string) => {
    setEditingId(commentId);
    setEditContent(text);
  };

  const handleSaveEdit = (commentId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    updateComment(
      { taskId: task.id, commentId, body: { content: trimmed } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent('');
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    deleteComment({ taskId: task.id, commentId });
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ mb: 2 }}
      >
        Комментарии
      </Typography>

      <Stack
        spacing={2}
        sx={{ mb: 3 }}
      >
        {comments.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Комментариев пока нет
          </Typography>
        )}

        {comments.map(comment => {
          const canManage = canManageComment(
            comment.authorId,
            task,
            currentUserId
          );
          const isEditing = editingId === comment.id;

          return (
            <Box
              key={comment.id}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'secondary.light',
              }}
            >
              {isEditing ? (
                <Stack spacing={1}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={editContent}
                    disabled={isPending}
                    onChange={e => setEditContent(e.target.value)}
                  />
                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      disabled={isPending}
                      onClick={() => handleSaveEdit(comment.id)}
                    >
                      Сохранить
                    </Button>
                    <Button
                      size="small"
                      disabled={isPending}
                      onClick={() => setEditingId(null)}
                    >
                      Отмена
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <>
                  <Typography variant="body1">{comment.content}</Typography>
                  <Stack
                    direction="row"
                    sx={{
                      mt: 1,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {new Date(comment.createdAt).toLocaleString('ru-RU')}
                    </Typography>

                    {canManage && (
                      <Stack direction="row">
                        <IconButton
                          size="small"
                          disabled={isPending}
                          onClick={() =>
                            handleStartEdit(comment.id, comment.content)
                          }
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          disabled={isPending}
                          onClick={() => handleDelete(comment.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>
                </>
              )}
            </Box>
          );
        })}
      </Stack>

      <Stack spacing={2}>
        <TextField
          fullWidth
          multiline
          minRows={2}
          placeholder="Написать комментарий…"
          value={content}
          disabled={isPending}
          onChange={e => setContent(e.target.value)}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={isPending || !content.trim()}
          >
            Отправить
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};
