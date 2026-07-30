import { Done, DoneAll, MoreVert } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEffect, useState, type MouseEvent } from 'react';

import { canManageComment, type TaskComment } from '@/entities/task';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

import { useIsCommentModifiable } from '../model/hooks/useIsCommentModifiable';
import {
  getGallerySlideIndex,
  hasCommentText,
  isGalleryMedia,
} from '../model/lib/commentMedia';

type TaskCommentItemProps = {
  comment: TaskComment;
  currentUserId: string | null;
  isOwner?: boolean;
  highlight?: string;
  isPending?: boolean;
  isEditing?: boolean;
  editContent?: string;
  onEditContentChange?: (value: string) => void;
  onStartEdit?: (commentId: string, text: string) => void;
  onSaveEdit?: (commentId: string) => void;
  onCancelEdit?: () => void;
  onDelete?: (commentId: string) => void;
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
    new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'gi')
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
    )
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
  isOwner = false,
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
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const isOwn = canManageComment(comment.authorId, currentUserId);
  const canModify = useIsCommentModifiable(comment, currentUserId, isOwner);
  const canEdit = canModify;
  const canDelete = canModify;
  const showMenu = showActions && !isEditing && (canEdit || canDelete);

  useEffect(() => {
    if (!showMenu) {
      setTimeout(() => {
        setMenuAnchor(null);
      }, 0);
    }
  }, [showMenu]);

  const commentMedia = comment.media ?? [];
  const hasMedia = commentMedia.length > 0;
  const hasText = hasCommentText(comment.content);
  const time = formatCommentTime(comment.createdAt);
  const editedTimeLabel = comment.editedAt
    ? format(new Date(comment.editedAt), 'HH:mm')
    : null;

  const bubbleColors = isOwn
    ? {
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        actionColor: 'common.white',
      }
    : {
        bgcolor: 'background.paper',
        color: 'text.primary',
        actionColor: 'text.secondary',
      };

  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => setMenuAnchor(null);

  const handleStartEdit = () => {
    handleCloseMenu();
    onStartEdit?.(comment.id, comment.content);
  };

  const handleDelete = () => {
    handleCloseMenu();
    onDelete?.(comment.id);
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
          maxWidth: { xs: '92%', sm: '78%', md: '68%' },
          alignItems: 'flex-end',
        }}
      >
        <Box
          sx={{
            p: 1.5,
            minWidth: 0,
            flex: 1,
            position: 'relative',
            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            bgcolor: bubbleColors.bgcolor,
            color: bubbleColors.color,
            boxShadow: isOwn ? 1 : 0,
            border: isOwn ? 'none' : '1px solid',
            borderColor: 'divider',
          }}
        >
          {showMenu && (
            <>
              <IconButton
                aria-label="Действия с комментарием"
                onClick={handleOpenMenu}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  zIndex: 1,
                  color: bubbleColors.actionColor,
                  opacity: 0.85,
                }}
              >
                <MoreVert sx={{ fontSize: 16 }} />
              </IconButton>

              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
              >
                {canEdit && (
                  <MenuItem
                    disabled={isPending}
                    onClick={handleStartEdit}
                  >
                    Редактировать
                  </MenuItem>
                )}
                {canDelete && (
                  <MenuItem
                    disabled={isPending}
                    onClick={handleDelete}
                  >
                    {isPending ? (
                      <CircularProgress
                        size={14}
                        sx={{ mr: 1 }}
                      />
                    ) : null}
                    Удалить
                  </MenuItem>
                )}
              </Menu>
            </>
          )}

          {hasMedia && (
            <Box
              sx={{
                gap: 1,
                display: 'flex',
                flexWrap: 'wrap',
                mb: hasText || isEditing ? 1 : 0,
                pr: showMenu ? 4 : 0,
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
                    cursor: isGalleryMedia(item.mimeType)
                      ? 'pointer'
                      : 'default',
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
                  pr: showMenu && !hasMedia ? 4 : 0,
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
              mt: hasText || hasMedia || isEditing ? 1 : 0,
              alignItems: 'center',
              justifyContent: isEditing ? 'space-between' : 'flex-end',
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

              {editedTimeLabel && (
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, whiteSpace: 'nowrap' }}
                >
                  · изменено {editedTimeLabel}
                </Typography>
              )}

              {isOwn &&
                !isEditing &&
                (comment.isRead ? (
                  <DoneAll sx={{ fontSize: 15, opacity: 0.9 }} />
                ) : (
                  <Done sx={{ fontSize: 15, opacity: 0.75 }} />
                ))}
            </Stack>

            {isEditing && (
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
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
