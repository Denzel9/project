import { Done, DoneAll, Forward, MoreVert } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { parseChatTaskTzMessage } from '@/entities/chat';
import { ROUTES, MarkdownContent } from '@/shared';
import {
  FullScreenImageViewer,
  getMediaKind,
  MediaItem,
} from '@/widgets/media';

import { useIsMessageDeletable } from '../model/hooks/useIsMessageDeletable';

import type { MessageSide } from '../model/types';
import type { ChatMessageMedia } from '@/entities/chat';

type ChatMessageBubbleProps = {
  messageId: string;
  senderId: string;
  createdAt: string;
  editedAt?: string | null;
  isRedirected?: boolean;
  currentUserId: string | null;
  text: string;
  media?: ChatMessageMedia[];
  side: MessageSide;
  time?: string;
  isRead?: boolean;
  highlight?: string;
  isDeleting?: boolean;
  isEditing?: boolean;
  fullWidth?: boolean;
  onDelete?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => Promise<boolean>;
  onForward?: (messageId: string) => void;
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
    )
  );
};

export const ChatMessageBubble = ({
  messageId,
  senderId,
  createdAt,
  editedAt = null,
  isRedirected = false,
  currentUserId,
  text,
  media = [],
  side,
  time,
  isRead = false,
  highlight,
  isDeleting = false,
  isEditing: isSavingEdit = false,
  fullWidth = false,
  onDelete,
  onEdit,
  onForward,
}: ChatMessageBubbleProps) => {
  const navigate = useNavigate();
  const isOutgoing = side === 'outgoing';
  const canModify = useIsMessageDeletable(createdAt, senderId, currentUserId);
  const hasText = Boolean(text.trim());
  const hasResponse = text === 'Новый отклик';
  const taskTzMessage = useMemo(() => parseChatTaskTzMessage(text), [text]);
  const isTaskTzMessage = Boolean(taskTzMessage);
  const canEdit =
    canModify && !hasResponse && !isRedirected && Boolean(onEdit);
  const canDelete = canModify && Boolean(onDelete);
  const canForward = !hasResponse && Boolean(onForward);
  const showMenu = canEdit || canDelete || canForward;
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(text);
  const [editError, setEditError] = useState<string | null>(null);

  const galleryImages = useMemo(
    () =>
      media
        .filter(item => getMediaKind(item.url, item.mimeType) === 'image')
        .map(item => ({ url: item.url, mimeType: item.mimeType })),
    [media]
  );

  const openGallery = (imageUrl: string) => {
    const slideIndex = galleryImages.findIndex(item => item.url === imageUrl);

    if (slideIndex < 0) {
      return;
    }

    setGalleryInitialSlide(slideIndex);
    setGalleryOpen(true);
  };

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleDelete = () => {
    handleCloseMenu();
    onDelete?.(messageId);
  };

  const handleForward = () => {
    handleCloseMenu();
    onForward?.(messageId);
  };

  const handleStartEdit = () => {
    handleCloseMenu();
    setDraftContent(text);
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftContent(text);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!onEdit) {
      return;
    }

    const trimmed = draftContent.trim();

    if (!trimmed && media.length === 0) {
      setEditError('Текст не может быть пустым без вложений');
      return;
    }

    setEditError(null);
    const success = await onEdit(messageId, draftContent);

    if (success) {
      setIsEditing(false);
    }
  };

  const editedTimeLabel = editedAt
    ? format(new Date(editedAt), 'HH:mm')
    : null;

  const hasMedia = media.length > 0;
  const showMediaMenu = showMenu && !isEditing && hasMedia;
  const showTextMenu = showMenu && !isEditing && !hasMedia;

  const actionsMenu = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleCloseMenu}
    >
      {canEdit && onEdit && (
        <MenuItem onClick={handleStartEdit}>Редактировать</MenuItem>
      )}
      {canForward && onForward && (
        <MenuItem onClick={handleForward}>Переслать</MenuItem>
      )}
      {canDelete && onDelete && (
        <MenuItem
          disabled={isDeleting}
          onClick={handleDelete}
        >
          {isDeleting ? (
            <CircularProgress
              size={16}
              sx={{ mr: 1 }}
            />
          ) : null}
          Удалить
        </MenuItem>
      )}
    </Menu>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        px: fullWidth ? 0 : 0.25,
        justifyContent: fullWidth
          ? 'flex-start'
          : isOutgoing
            ? 'flex-end'
            : 'flex-start',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          px: 1.75,
          py: 1.25,
          width: fullWidth ? '100%' : undefined,
          maxWidth: fullWidth
            ? '100%'
            : isTaskTzMessage
              ? { xs: '92%', sm: '85%' }
              : { xs: '85%', sm: '72%' },
          minWidth: fullWidth ? 0 : 150,
          boxShadow: isOutgoing
            ? '0 2px 8px rgba(77, 144, 142, 0.28)'
            : '0 1px 3px rgba(0, 0, 0, 0.08)',
          borderRadius: isOutgoing
            ? '20px 20px 6px 20px'
            : '20px 20px 20px 6px',
          bgcolor: isOutgoing ? 'primary.main' : 'common.white',
          color: isOutgoing ? 'common.white' : 'text.primary',
          border: isOutgoing ? 'none' : '1px solid',
          borderColor: isOutgoing ? 'transparent' : 'divider',
        }}
      >
        {showMediaMenu && (
          <>
            <IconButton
              aria-label="Действия с сообщением"
              onClick={handleOpenMenu}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                zIndex: 1,
                color: isOutgoing ? 'common.white' : 'text.secondary',
                opacity: 0.85,
                bgcolor: isOutgoing
                  ? 'rgba(0, 0, 0, 0.2)'
                  : 'rgba(255, 255, 255, 0.72)',
                '&:hover': {
                  bgcolor: isOutgoing
                    ? 'rgba(0, 0, 0, 0.32)'
                    : 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
            {actionsMenu}
          </>
        )}

        {isRedirected && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
              mb: 0.75,
              pr: showMediaMenu ? 4 : 0,
              opacity: isOutgoing ? 0.85 : 0.65,
            }}
          >
            <Forward
              sx={{
                fontSize: 14,
                flexShrink: 0,
                transform: 'scaleX(-1)',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.6875rem',
                lineHeight: 1,
                fontStyle: 'italic',
              }}
            >
              Переслано
            </Typography>
          </Stack>
        )}

        {hasMedia && (
          <Stack
            spacing={1}
            sx={{
              mb: hasText || isEditing ? 1 : 0,
              pr: showMediaMenu && !isRedirected ? 3.5 : 0,
            }}
          >
            {media.map(item => {
              const kind = getMediaKind(item.url, item.mimeType);
              const isImage = kind === 'image';

              return (
                <Box
                  key={item.key}
                  onClick={event => {
                    event.stopPropagation();

                    if (isImage) {
                      openGallery(item.url);
                    }
                  }}
                  sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    maxWidth: 280,
                    cursor: isImage ? 'zoom-in' : 'default',
                    ...(kind !== 'document' && {
                      minHeight: 120,
                    }),
                    ...(isImage && {
                      '&:hover': {
                        opacity: 0.92,
                      },
                    }),
                  }}
                >
                  <MediaItem
                    src={item.url}
                    alt="Вложение"
                    mimeType={item.mimeType}
                    fileName={item.key.split('/').pop()}
                  />
                </Box>
              );
            })}
          </Stack>
        )}

        {hasResponse && (
          <Stack
            direction="column"
            spacing={2}
          >
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.5 }}
            >
              {text}
            </Typography>

            <Button
              color={isOutgoing ? 'secondary' : 'primary'}
              variant="contained"
              onClick={() => navigate(`${ROUTES.MY_RESPONSES}/${senderId}`)}
              sx={{
                alignSelf: 'flex-start',
                py: 1,
                px: 2.5,
              }}
            >
              Посмотреть
            </Button>
          </Stack>
        )}

        <Stack
          direction="row"
          sx={{
            alignItems: 'start',
            justifyContent: 'space-between',
          }}
        >
          {isEditing ? (
            <Stack
              spacing={1}
              sx={{
                flex: 1,
                minWidth: 0,
                mr: showTextMenu ? 0.5 : 0,
              }}
            >
              <TextField
                multiline
                minRows={2}
                maxRows={8}
                fullWidth
                value={draftContent}
                disabled={isSavingEdit}
                onChange={event => setDraftContent(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Escape') {
                    handleCancelEdit();
                  }
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: isOutgoing
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'background.paper',
                    color: isOutgoing ? 'common.white' : 'text.primary',
                    fontSize: '0.875rem',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isOutgoing
                      ? 'rgba(255, 255, 255, 0.35)'
                      : 'divider',
                  },
                }}
              />

              {editError && (
                <Alert
                  severity="error"
                  sx={{ py: 0, fontSize: '0.75rem' }}
                >
                  {editError}
                </Alert>
              )}

              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'flex-end' }}
              >
                <Button
                  size="small"
                  variant="text"
                  disabled={isSavingEdit}
                  onClick={handleCancelEdit}
                  sx={{
                    color: isOutgoing ? 'common.white' : 'text.secondary',
                  }}
                >
                  Отмена
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color={isOutgoing ? 'secondary' : 'primary'}
                  disabled={isSavingEdit}
                  onClick={() => void handleSaveEdit()}
                  startIcon={
                    isSavingEdit ? (
                      <CircularProgress
                        size={14}
                        color="inherit"
                      />
                    ) : undefined
                  }
                >
                  Сохранить
                </Button>
              </Stack>
            </Stack>
          ) : (
            <>
              {!hasResponse && hasText && isTaskTzMessage && taskTzMessage && (
                <MarkdownContent
                  content={taskTzMessage.content}
                  sx={{
                    fontSize: '0.875rem',
                    color: isOutgoing ? 'common.white' : 'text.primary',
                    '& p, & li, & h1, & h2, & strong': {
                      color: isOutgoing ? 'common.white' : 'text.primary',
                    },
                    '& h1': {
                      fontSize: '1rem',
                      fontWeight: 700,
                      mb: 1,
                    },
                    '& h2': {
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      mt: 1.25,
                      mb: 0.5,
                    },
                    '& a': {
                      color: isOutgoing ? 'common.white' : 'primary.main',
                      textDecoration: 'underline',
                    },
                    '& code': {
                      bgcolor: isOutgoing
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'action.hover',
                      px: 0.5,
                      borderRadius: 0.5,
                    },
                  }}
                />
              )}

              {!hasResponse && hasText && !isTaskTzMessage && (
                <Typography
                  variant="body2"
                  sx={{
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {renderHighlightedText(text, highlight)}
                </Typography>
              )}
            </>
          )}

          {showTextMenu && (
            <>
              <IconButton
                aria-label="Действия с сообщением"
                onClick={handleOpenMenu}
                sx={{
                  color: isOutgoing ? 'common.white' : 'text.secondary',
                  opacity: 0.85,
                }}
              >
                <MoreVert sx={{ fontSize: 16 }} />
              </IconButton>
              {actionsMenu}
            </>
          )}
        </Stack>

        {(time || editedTimeLabel || isOutgoing || showMenu) && !isEditing && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              mt: 0.75,
              gap: 0.5,
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {editedTimeLabel && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  lineHeight: 1,
                  opacity: isOutgoing ? 0.75 : 0.5,
                  color: isOutgoing ? 'common.white' : 'text.secondary',
                }}
              >
                изменено {editedTimeLabel}
              </Typography>
            )}

            {time && (
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.6875rem',
                  lineHeight: 1,
                  opacity: isOutgoing ? 0.85 : 0.55,
                  color: isOutgoing ? 'common.white' : 'text.secondary',
                }}
              >
                {time}
              </Typography>
            )}

            {isOutgoing &&
              (isRead ? (
                <DoneAll
                  sx={{
                    fontSize: 15,
                    opacity: 0.9,
                    color: 'common.white',
                  }}
                />
              ) : (
                <Done
                  sx={{
                    fontSize: 15,
                    opacity: 0.75,
                    color: 'common.white',
                  }}
                />
              ))}
          </Stack>
        )}
      </Box>

      <FullScreenImageViewer
        items={galleryImages}
        isOpen={galleryOpen}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box>
  );
};
