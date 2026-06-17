import { Delete, Edit } from '@mui/icons-material';
import {
  Avatar,
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
  useUpdateTaskCommentMutation,
  type Task,
} from '@/entities/task';
import { useGetUserByIdQuery, type User } from '@/entities/user';
import { useAuthStore } from '@/features/auth';

import { DeleteCommentDialog } from './DeleteCommentDialog';

type TaskCommentsProps = {
  task: Task;
  contact?: User;
};

export const TaskComments = ({ task, contact }: TaskCommentsProps) => {
  const currentUserId = useAuthStore(state => state.id);
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const { mutate: createComment, isPending: isCreating } =
    useCreateTaskCommentMutation();
  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateTaskCommentMutation();
  const { data: user } = useGetUserByIdQuery(currentUserId || '');

  const comments = task.comments ?? [];
  const isPending = isCreating || isUpdating;

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
    setDeletingId(commentId);
    setIsOpenDeleteDialog(true);
  };

  return (
    <Box sx={{ bgcolor: 'white', p: { xs: 3, md: 4 }, borderRadius: '32px' }}>
      <Typography
        variant="h6"
        sx={{ mb: 2 }}
      >
        Комментарии
      </Typography>

      <Stack
        spacing={2}
        sx={{ mb: 3 }}
        direction="column"
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
          const canManage = canManageComment(comment.authorId, currentUserId);
          const isEditing = editingId === comment.id;

          return (
            <Box
              key={comment.id}
              sx={{
                p: 2,
                width: '70%',
                borderRadius: '16px',
                alignSelf: canManage ? 'end' : 'start',
                bgcolor: canManage ? 'primary.light' : 'secondary.light',
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
                <Stack
                  direction="row"
                  spacing={2}
                >
                  <Avatar
                    src={
                      (canManage ? user?.data?.avatar : contact?.avatar) || ''
                    }
                  />
                  <Box sx={{ width: '100%' }}>
                    <Stack
                      direction="row"
                      sx={{ justifyContent: 'space-between' }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ color: canManage ? 'white' : 'black' }}
                      >
                        {comment.content}
                      </Typography>

                      {comment?.createdAt !== comment?.updatedAt && (
                        <Typography
                          variant="caption"
                          sx={{ color: canManage ? 'white' : 'black' }}
                        >
                          Изменено
                        </Typography>
                      )}
                    </Stack>

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
                        sx={{ color: canManage ? 'white' : 'black' }}
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
                            <Edit
                              fontSize="small"
                              sx={{
                                color: 'white',
                              }}
                            />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            disabled={isPending}
                            onClick={() => handleDelete(comment?.id)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                </Stack>
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

      <DeleteCommentDialog
        taskId={task?.id}
        commentId={deletingId}
        open={isOpenDeleteDialog}
        onClose={() => setIsOpenDeleteDialog(false)}
      />
    </Box>
  );
};
