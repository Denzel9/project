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

import {
  canDeleteComment,
  canManageComment,
  type TaskComment,
} from '@/entities/task';
import type { User } from '@/entities/user';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

import {
  getGallerySlideIndex,
  hasCommentText,
  isGalleryMedia,
} from '../lib/commentMedia';

type TaskCommentItemProps = {
  comment: TaskComment;
  currentUserId: string | null;
  userAvatar?: string;
  contactAvatar?: string;
  highlight?: string;
  isPending?: boolean;
  isEditing?: boolean;
  editContent?: string;
  onEditContentChange?: (value: string) => void;
  onStartEdit?: (commentId: string, text: string) => void;
  onSaveEdit?: (commentId: string) => void;
  onCancelEdit?: () => void;
  onDelete?: (commentId: string, createdAt: string) => void;
  onOpenGallery?: (media: TaskComment['media'], initialSlide: number) => void;
  showActions?: boolean;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedText = (text: string, highlight?: string) => {
  const trimmedHighlight = highlight?.trim();

  if (!trimmedHighlight) {
    return text;
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'gi'),
  );

  return parts.map((part, index) =>
    part.toLowerCase() === trimmedHighlight.toLowerCase() ? (
      <Box
        key={`${part}-${index}`}
        component="mark"
        sx={{
          bgcolor: 'warning.light',
          color: 'inherit',
          px: 0.25,
          borderRadius: 0.5,
        }}
      >
        {part}
      </Box>
    ) : (
      part
    ),
  );
};

export const TaskCommentItem = ({
  comment,
  currentUserId,
  userAvatar = '',
  contactAvatar = '',
  highlight,
  isPending = false,
  isEditing = false,
  editContent = '',
  onEditContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onOpenGallery,
  showActions = true,
}: TaskCommentItemProps) => {
  const canManage = canManageComment(comment.authorId, currentUserId);
  const canDelete = canDeleteComment(comment.createdAt);
  const commentMedia = comment.media ?? [];
  const hasText = hasCommentText(comment.content);
  const textColor = canManage ? 'white' : 'black';

  const handleMediaClick = (index: number) => {
    const item = commentMedia[index];

    if (!item || !isGalleryMedia(item.mimeType) || !onOpenGallery) return;

    onOpenGallery(commentMedia, getGallerySlideIndex(commentMedia, index));
  };

  if (isEditing) {
    return (
      <Box
        sx={{
          p: 2,
          width: '70%',
          borderRadius: '16px',
          alignSelf: canManage ? 'end' : 'start',
          bgcolor: canManage ? 'primary.light' : 'secondary.light',
        }}
      >
        <Stack spacing={1}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={editContent}
            disabled={isPending}
            onChange={event => onEditContentChange?.(event.target.value)}
          />
          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              size="small"
              variant="contained"
              disabled={isPending}
              onClick={() => onSaveEdit?.(comment.id)}
            >
              Сохранить
            </Button>
            <Button
              size="small"
              disabled={isPending}
              onClick={onCancelEdit}
            >
              Отмена
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        width: '70%',
        borderRadius: '16px',
        alignSelf: canManage ? 'end' : 'start',
        bgcolor: canManage ? 'primary.light' : 'secondary.light',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
      >
        <Avatar src={(canManage ? userAvatar : contactAvatar) || ''} />
        <Box sx={{ width: '100%' }}>
          {commentMedia.length > 0 && (
            <Stack
              spacing={1}
              sx={{ mb: hasText ? 1 : 0 }}
            >
              {commentMedia.map((item, index) => (
                <Box
                  key={item.key}
                  sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    maxWidth: 280,
                    cursor: isGalleryMedia(item.mimeType) ? 'pointer' : 'default',
                  }}
                  onClick={() => handleMediaClick(index)}
                >
                  <MediaItem
                    src={item.url}
                    alt="Вложение"
                    mimeType={item.mimeType}
                  />
                </Box>
              ))}
            </Stack>
          )}

          <Stack
            direction="row"
            sx={{ justifyContent: 'space-between' }}
          >
            {hasText && (
              <Typography
                variant="body1"
                sx={{ color: textColor }}
              >
                {renderHighlightedText(comment.content, highlight)}
              </Typography>
            )}

            {comment.createdAt !== comment.updatedAt && (
              <Typography
                variant="caption"
                sx={{ color: textColor }}
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
              sx={{ color: textColor }}
            >
              {new Date(comment.createdAt).toLocaleString('ru-RU')}
            </Typography>

            {showActions && canManage && (
              <Stack direction="row">
                <IconButton
                  size="small"
                  disabled={isPending}
                  onClick={() => onStartEdit?.(comment.id, comment.content)}
                >
                  <Edit
                    fontSize="small"
                    sx={{ color: 'white' }}
                  />
                </IconButton>

                {canDelete && (
                  <IconButton
                    size="small"
                    color="error"
                    disabled={isPending}
                    onClick={() => onDelete?.(comment.id, comment.createdAt)}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
