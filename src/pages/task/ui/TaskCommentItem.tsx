import { Delete, Edit } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import {
  canDeleteComment,
  canEditComment,
  canManageComment,
  type TaskComment,
} from '@/entities/task';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

import {
  getGallerySlideIndex,
  hasCommentText,
  isGalleryMedia,
} from '../model/lib/commentMedia';

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
          px: 0.25,
          borderRadius: 0.5,
          color: 'inherit',
          bgcolor: 'warning.light',
        }}
      >
        {part}
      </Box>
    ) : (
      part
    ),
  );
};

const formatCommentTime = (date: string) => {
  const parsed = new Date(date);

  return {
    relative: formatDistanceToNow(parsed, { addSuffix: true, locale: ru }),
    full: format(parsed, 'dd.MM.yyyy HH:mm'),
  };
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
  const isOwn = canManageComment(comment.authorId, currentUserId);
  const canEdit = canEditComment(comment.createdAt);
  const canDelete = canDeleteComment(comment.createdAt);
  const commentMedia = comment.media ?? [];
  const hasText = hasCommentText(comment.content);
  const time = formatCommentTime(comment.createdAt);

  const bubbleColors = isOwn
    ? {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        actionColor: 'primary.contrastText',
      }
    : {
        bgcolor: 'background.paper',
        color: 'text.primary',
        actionColor: 'text.secondary',
      };

  const handleMediaClick = (index: number) => {
    const item = commentMedia[index];

    if (!item || !isGalleryMedia(item.mimeType) || !onOpenGallery) return;

    onOpenGallery(commentMedia, getGallerySlideIndex(commentMedia, index));
  };

  return (
    <Box
      id={`comment-${comment.id}`}
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
      }}
    >
      <Stack
        direction={isOwn ? 'row-reverse' : 'row'}
        spacing={1.5}
        sx={{
          width: '100%',
          maxWidth: { xs: '92%', sm: '78%', md: '68%' },
          alignItems: 'flex-end',
        }}
      >
        <Avatar
          src={(isOwn ? userAvatar : contactAvatar) || undefined}
          sx={{ width: 32, height: 32, flexShrink: 0 }}
        />

        <Box
          sx={{
            p: 1.5,
            minWidth: 0,
            flex: 1,
            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            bgcolor: bubbleColors.bgcolor,
            color: bubbleColors.color,
            boxShadow: isOwn ? 1 : 0,
            border: isOwn ? 'none' : '1px solid',
            borderColor: 'divider',
          }}
        >
          {commentMedia.length > 0 && (
            <Box
              sx={{
                gap: 1,
                display: 'flex',
                flexWrap: 'wrap',
                mb: hasText || isEditing ? 1 : 0,
              }}
            >
              {commentMedia.map((item, index) => (
                <Box
                  key={item.key}
                  sx={{
                    width: 112,
                    height: 112,
                    flexShrink: 0,
                    overflow: 'hidden',
                    borderRadius: '12px',
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
            </Box>
          )}

          {isEditing ? (
            <InputBase
              fullWidth
              multiline
              value={editContent}
              disabled={isPending}
              placeholder="Текст комментария"
              onChange={event => onEditContentChange?.(event.target.value)}
              sx={{
                width: '100%',
                color: 'inherit',
                fontSize: theme => theme.typography.body2.fontSize,
                lineHeight: 1.5,
                '& .MuiInputBase-input': {
                  p: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'inherit',
                  opacity: 0.6,
                },
              }}
            />
          ) : (
            hasText && (
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.5,
                }}
              >
                {renderHighlightedText(comment.content, highlight)}
              </Typography>
            )
          )}

          <Stack
            direction="row"
            spacing={1}
            sx={{
              mt: hasText || commentMedia.length || isEditing ? 1 : 0,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: 'center', minWidth: 0 }}
            >
              <Typography
                variant="caption"
                title={time.full}
                sx={{ opacity: 0.8, whiteSpace: 'nowrap' }}
              >
                {time.relative}
              </Typography>

              {comment.createdAt !== comment.updatedAt && (
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, whiteSpace: 'nowrap' }}
                >
                  · изменено
                </Typography>
              )}
            </Stack>

            {isEditing ? (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ flexShrink: 0 }}
              >
                <Button
                  size="small"
                  variant={isOwn ? 'outlined' : 'contained'}
                  disabled={isPending}
                  onClick={() => onSaveEdit?.(comment.id)}
                  sx={
                    isOwn
                      ? {
                          minWidth: 0,
                          px: 1,
                          py: 0.25,
                          color: 'inherit',
                          borderColor: 'currentColor',
                        }
                      : { minWidth: 0, px: 1, py: 0.25 }
                  }
                >
                  Сохранить
                </Button>
                <Button
                  size="small"
                  disabled={isPending}
                  onClick={onCancelEdit}
                  sx={{
                    minWidth: 0,
                    px: 1,
                    py: 0.25,
                    color: 'inherit',
                  }}
                >
                  Отмена
                </Button>
              </Stack>
            ) : (
              showActions &&
              isOwn && (
                <Stack
                  direction="row"
                  sx={{ flexShrink: 0 }}
                >
                  {canEdit && (
                    <IconButton
                      size="small"
                      disabled={isPending}
                      onClick={() => onStartEdit?.(comment.id, comment.content)}
                      sx={{ color: bubbleColors.actionColor }}
                    >
                      <Edit sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}

                  {canDelete && (
                    <IconButton
                      size="small"
                      disabled={isPending}
                      onClick={() => onDelete?.(comment.id, comment.createdAt)}
                      sx={{ color: bubbleColors.actionColor }}
                    >
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Stack>
              )
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
