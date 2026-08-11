import { Done, DoneAll, Forward, MoreVert } from '@mui/icons-material'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import { format } from 'date-fns'
import { useMemo, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router'

import { parseChatTaskTzMessage, type ChatMessage, type ChatMessagePinScope } from '@/entities/chat'
import { ROUTES, MarkdownContent } from '@/shared'
import { ActionActorCaption } from '@/shared/ui/action-actor-caption/ActionActorCaption'
import { FullScreenImageViewer, getMediaKind } from '@/widgets/media'

import { useIsMessageDeletable } from '../model/hooks/useIsMessageDeletable'

import { ChatMediaAlbum } from './ChatMediaAlbum'

type ChatMessageBubbleProps = {
  message: ChatMessage
  currentUserId: string | null
  senderAvatar?: string | null
  senderName?: string | null
  isPinned?: boolean
  canUnpin?: boolean
  highlight?: string
  isDeleting?: boolean
  isEditing?: boolean
  fullWidth?: boolean
  isHighlighted?: boolean
  selectionMode?: boolean
  selected?: boolean
  onToggleSelect?: (messageId: string) => void
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, content: string) => Promise<boolean>
  onForward?: (messageId: string) => void
  onPin?: (
    messageId: string,
    nextPinned: boolean,
    scope?: ChatMessagePinScope,
  ) => void
  onReply?: (message: ChatMessage) => void
  onCopy?: (messageId: string) => void
  onMarkUnread?: (messageId: string) => void
  onEnterSelection?: (messageId: string) => void
  onReplyJump?: (messageId: string) => void
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const renderHighlightedText = (text: string, highlight?: string) => {
  const trimmedHighlight = highlight?.trim()

  if (!trimmedHighlight) {
    return text
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'gi'),
  )

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
  )
}

const MetaRow = ({
  time,
  editedTimeLabel,
  isOutgoing,
  isRead,
  overlay,
}: {
  time?: string
  editedTimeLabel: string | null
  isOutgoing: boolean
  isRead: boolean
  overlay?: boolean
}) => (
  <Stack
    direction="row"
    spacing={0.5}
    sx={{
      alignItems: 'center',
      justifyContent: 'flex-end',
      ...(overlay
        ? {
          position: 'absolute',
          right: 8,
          bottom: 8,
          zIndex: 1,
          px: 0.75,
          py: 0.25,
          borderRadius: '10px',
          bgcolor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
        }
        : { mt: 0.5 }),
    }}
  >
    {editedTimeLabel && (
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.6875rem',
          lineHeight: 1,
          opacity: overlay ? 0.95 : isOutgoing ? 0.72 : 0.5,
          color: overlay || isOutgoing ? 'common.white' : 'text.secondary',
        }}
      >
        изм. {editedTimeLabel}
      </Typography>
    )}

    {time && (
      <Typography
        variant="caption"
        sx={{
          fontSize: '0.6875rem',
          lineHeight: 1.1,
          fontWeight: 500,
          letterSpacing: '0.01em',
          opacity: overlay ? 0.95 : isOutgoing ? 0.8 : 0.55,
          color: overlay || isOutgoing ? 'common.white' : 'text.secondary',
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
            color: overlay ? 'common.white' : 'common.white',
            opacity: 0.95,
          }}
        />
      ) : (
        <Done
          sx={{
            fontSize: 15,
            color: 'common.white',
            opacity: 0.8,
          }}
        />
      ))}
  </Stack>
)

export const ChatMessageBubble = ({
  message,
  currentUserId,
  senderAvatar = null,
  senderName = null,
  isPinned = false,
  canUnpin = false,
  highlight,
  isHighlighted = false,
  isDeleting = false,
  isEditing: isSavingEdit = false,
  fullWidth = false,
  selectionMode = false,
  selected = false,
  onToggleSelect,
  onDelete,
  onEdit,
  onForward,
  onPin,
  onReply,
  onCopy,
  onMarkUnread,
  onEnterSelection,
  onReplyJump,
}: ChatMessageBubbleProps) => {
  const {
    id: messageId,
    senderId,
    actorDisplayName = null,
    actorKind = null,
    createdAt,
    editedAt = null,
    isRedirected = false,
    redirectedFromDisplayName = null,
    replyToId = null,
    replyToPreview = null,
    replyToSenderName = null,
    content: text,
    media = [],
    isRead = false,
  } = message

  const navigate = useNavigate()
  const isOutgoing = Boolean(currentUserId && senderId === currentUserId)
  const time = format(new Date(createdAt), 'HH:mm')
  const canEditByWindow = useIsMessageDeletable(createdAt, senderId, currentUserId)
  const hasText = Boolean(text.trim())
  const hasResponse = text === 'Новый отклик'
  const taskTzMessage = useMemo(() => parseChatTaskTzMessage(text), [text])
  const isTaskTzMessage = Boolean(taskTzMessage)
  const canEdit =
    canEditByWindow && !hasResponse && !isRedirected && Boolean(onEdit)
  // Hide-for-me: any message can be deleted when handler is provided
  const canDelete = Boolean(onDelete)
  const canForward = !hasResponse && Boolean(onForward)
  const canReply = !hasResponse && Boolean(onReply)
  const canCopy = hasText || media.length > 0
  const canSelect = Boolean(onEnterSelection)
  const canMarkUnread = Boolean(onMarkUnread)
  const canPin = Boolean(onPin) && !isPinned
  const canUnpinPin = Boolean(onPin) && isPinned && canUnpin
  const showPinActions = canPin || canUnpinPin
  const showMenu =
    !selectionMode &&
    (canEdit ||
      canDelete ||
      canForward ||
      canReply ||
      canCopy ||
      canSelect ||
      canMarkUnread ||
      showPinActions)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [draftContent, setDraftContent] = useState(text)
  const [editError, setEditError] = useState<string | null>(null)

  const galleryImages = useMemo(
    () =>
      media
        .filter(item => getMediaKind(item.url, item.mimeType) === 'image')
        .map(item => ({ url: item.url, mimeType: item.mimeType })),
    [media],
  )

  const hasMedia = media.length > 0
  const hasVisualMedia = media.some(item => {
    const kind = getMediaKind(item.url, item.mimeType)
    return kind === 'image' || kind === 'video'
  })
  const isMediaOnly = hasMedia && !hasText && !isEditing && !hasResponse
  const showMetaOverlay = isMediaOnly && hasVisualMedia && !isTaskTzMessage

  const openGallery = (imageUrl: string) => {
    const slideIndex = galleryImages.findIndex(item => item.url === imageUrl)
    if (slideIndex < 0) return
    setGalleryInitialSlide(slideIndex)
    setGalleryOpen(true)
  }

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setMenuAnchor(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setMenuAnchor(null)
  }

  const handleDelete = () => {
    handleCloseMenu()
    onDelete?.(messageId)
  }

  const handleForward = () => {
    handleCloseMenu()
    onForward?.(messageId)
  }

  const handlePin = (scope: ChatMessagePinScope) => {
    handleCloseMenu()
    onPin?.(messageId, true, scope)
  }

  const handleUnpin = () => {
    handleCloseMenu()
    onPin?.(messageId, false)
  }

  const handleReply = () => {
    handleCloseMenu()
    onReply?.(message)
  }

  const handleCopy = async () => {
    handleCloseMenu()
    const payload = text.trim() || media[0]?.url || ''

    if (!payload) return

    try {
      await navigator.clipboard.writeText(payload)
    } catch {
      // ignore clipboard failures
    }

    onCopy?.(messageId)
  }

  const handleEnterSelection = () => {
    handleCloseMenu()
    onEnterSelection?.(messageId)
  }

  const handleMarkUnread = () => {
    handleCloseMenu()
    onMarkUnread?.(messageId)
  }

  const handleStartEdit = () => {
    handleCloseMenu()
    setDraftContent(text)
    setEditError(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setDraftContent(text)
    setEditError(null)
  }

  const handleSaveEdit = async () => {
    if (!onEdit) return

    const trimmed = draftContent.trim()

    if (!trimmed && media.length === 0) {
      setEditError('Текст не может быть пустым без вложений')
      return
    }

    setEditError(null)
    const success = await onEdit(messageId, draftContent)

    if (success) {
      setIsEditing(false)
    }
  }

  const handleBubbleClick = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect(messageId)
    }
  }

  const editedTimeLabel = editedAt
    ? format(new Date(editedAt), 'HH:mm')
    : null

  const forwardedLabel = redirectedFromDisplayName
    ? `Переслано от ${redirectedFromDisplayName}`
    : 'Переслано'

  const actionsMenu = (
    <Menu
      anchorEl={menuAnchor}
      open={Boolean(menuAnchor)}
      onClose={handleCloseMenu}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '14px',
            minWidth: 180,
            boxShadow: '0 8px 28px rgba(15, 23, 42, 0.12)',
          },
        },
      }}
    >
      {canReply && onReply && (
        <MenuItem onClick={handleReply}>Ответить</MenuItem>
      )}
      {canEdit && onEdit && (
        <MenuItem onClick={handleStartEdit}>Редактировать</MenuItem>
      )}
      {(canReply || canEdit) &&
        (canCopy || canSelect || canForward || showPinActions) && <Divider />}
      {canCopy && (
        <MenuItem onClick={() => void handleCopy()}>Копировать</MenuItem>
      )}
      {canSelect && onEnterSelection && (
        <MenuItem onClick={handleEnterSelection}>Выбрать</MenuItem>
      )}
      {canForward && onForward && (
        <MenuItem onClick={handleForward}>Переслать</MenuItem>
      )}
      {canPin && (
        <MenuItem onClick={() => handlePin('PERSONAL')}>
          Закрепить для себя
        </MenuItem>
      )}
      {canPin && (
        <MenuItem onClick={() => handlePin('SHARED')}>
          Закрепить для всех
        </MenuItem>
      )}
      {canUnpinPin && (
        <MenuItem onClick={handleUnpin}>Открепить</MenuItem>
      )}
      {(canReply || canEdit || canCopy || canSelect || canForward || showPinActions) &&
        (canMarkUnread || canDelete) && <Divider />}
      {canMarkUnread && onMarkUnread && (
        <MenuItem onClick={handleMarkUnread}>Пометить непрочитанным</MenuItem>
      )}
      {canMarkUnread && canDelete && <Divider />}
      {canDelete && onDelete && (
        <MenuItem disabled={isDeleting} onClick={handleDelete}>
          {isDeleting ? (
            <CircularProgress size={16} sx={{ mr: 1 }} />
          ) : null}
          Удалить
        </MenuItem>
      )}
    </Menu>
  )

  return (
    <Box
      onClick={handleBubbleClick}
      sx={{
        gap: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'end',
        px: fullWidth ? 0 : 0.5,
        cursor: selectionMode ? 'pointer' : 'default',
        justifyContent: fullWidth
          ? 'flex-start'
          : isOutgoing
            ? 'flex-end'
            : 'flex-start',
      }}
    >
      {selectionMode && (
        <Checkbox
          checked={selected}
          onClick={event => event.stopPropagation()}
          onChange={() => onToggleSelect?.(messageId)}
          size="small"
          sx={{ mt: 1.5, p: 0.5, flexShrink: 0 }}
        />
      )}

      {!isOutgoing && !selectionMode && (
        <Avatar
          alt={senderName ?? undefined}
          src={senderAvatar ?? undefined}
          sx={{ width: 32, height: 32, display: { xs: 'none', md: 'block' } }}
        />
      )}
      <Box
        sx={{
          pt: 1,
          position: 'relative',
          pr: showMenu && !isEditing ? 3 : 0,
          p: 2,
          alignItems: 'start',
          justifyContent: 'space-between',
          bgcolor: isHighlighted
            ? 'primary.light'
            : selected
              ? theme => alpha(theme.palette.primary.main, isOutgoing ? 0.85 : 0.12)
              : isOutgoing
                ? 'primary.main'
                : theme => alpha(theme.palette.common.white, 0.96),
          maxWidth: fullWidth
            ? '100%'
            : isTaskTzMessage && hasMedia
              ? { xs: '86%', sm: '56%' }
              : isTaskTzMessage
                ? { xs: '90%', sm: '72%' }
                : hasMedia
                  ? { xs: '82%', sm: '52%' }
                  : { xs: '82%', sm: '64%' },
          minWidth: fullWidth ? 0 : 200,
          transition:
            'background-color 200ms ease, box-shadow 200ms ease',
          borderRadius: isOutgoing
            ? '18px 18px 6px 18px'
            : '18px 18px 18px 6px',
          color: isOutgoing ? 'common.white' : 'text.primary',
          border: isOutgoing ? 'none' : '1px solid',
          borderColor: isOutgoing
            ? 'transparent'
            : selected
              ? 'primary.main'
              : 'divider',
          boxShadow: isOutgoing
            ? '0 4px 14px rgba(61, 122, 120, 0.22)'
            : '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.04)',

        }}
      >
        {replyToPreview && (
          <Box
            onClick={event => {
              event.stopPropagation()
              if (replyToId) {
                onReplyJump?.(replyToId)
              }
            }}
            sx={{
              mb: 0.75,
              px: 1,
              py: 0.5,
              borderRadius: '10px',
              borderLeft: '3px solid',
              borderColor: isOutgoing
                ? 'rgba(255,255,255,0.7)'
                : 'primary.main',
              bgcolor: isOutgoing
                ? 'rgba(255,255,255,0.12)'
                : 'action.hover',
              cursor: replyToId && onReplyJump ? 'pointer' : 'default',
            }}
          >
            {replyToSenderName && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.6875rem',
                  lineHeight: 1.2,
                  mb: 0.25,
                  opacity: isOutgoing ? 0.9 : 1,
                  color: isOutgoing ? 'common.white' : 'primary.main',
                }}
              >
                {replyToSenderName}
              </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                fontSize: '0.75rem',
                lineHeight: 1.3,
                opacity: isOutgoing ? 0.85 : 0.75,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {replyToPreview}
            </Typography>
          </Box>
        )}

        {isRedirected && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              alignItems: 'center',
              mb: 0.5,
              px: isMediaOnly ? 0.75 : 0,
              pt: isMediaOnly ? 0.5 : 0,
              opacity: isOutgoing ? 0.85 : 0.6,
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
              {forwardedLabel}
            </Typography>
          </Stack>
        )}

        <Stack
          direction="row"
          spacing={2}
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: actorDisplayName ? 'space-between' : 'flex-end',
            mb: hasMedia || hasText ? 0.75 : 0,
            px: isMediaOnly ? 0.75 : 0,
            pt: isMediaOnly ? 0.35 : 0,
            '& .MuiTypography-root': {
              color: isOutgoing ? 'rgba(255,255,255,0.85)' : undefined,
              fontWeight: 600,
              fontSize: '0.75rem',
              lineHeight: 1.2,
            },
            '& .MuiTypography-root:first-of-type': {
              color: isOutgoing
                ? 'rgba(255,255,255,0.7)'
                : 'primary.main',
              fontWeight: 500,
            },
          }}
        >
          <ActionActorCaption
            actor={{ actorDisplayName, actorKind }}
            direction="row"
            spacing={0.5}
          />

          {showMenu && !isEditing && (
            <>
              <IconButton
                aria-label="Действия с сообщением"
                onClick={handleOpenMenu}
                size="small"
                sx={{
                  zIndex: 2,
                  width: 28,
                  height: 28,
                  color: isOutgoing || isMediaOnly ? 'common.white' : 'text.secondary',
                  opacity: 0.75,
                  '&:hover': {
                    opacity: 1,
                    bgcolor:
                      isMediaOnly || isOutgoing
                        ? 'rgba(0, 0, 0, 0.4)'
                        : 'action.hover',
                  },
                }}
              >
                <MoreVert sx={{ fontSize: 16 }} />
              </IconButton>
              {actionsMenu}
            </>
          )}
        </Stack>

        {hasMedia && (
          <Box
            sx={{
              mt: actorDisplayName || replyToPreview || isRedirected ? 0 : 0,
              position: 'relative',
              mb: hasText || isEditing ? 1 : 0,
            }}
          >
            <ChatMediaAlbum media={media} onOpenImage={openGallery} />

            {showMetaOverlay && (
              <MetaRow
                overlay
                time={time}
                isRead={isRead}
                isOutgoing={isOutgoing}
                editedTimeLabel={editedTimeLabel}
              />
            )}
          </Box>
        )}

        {hasResponse && (
          <Stack direction="column" spacing={1.5} sx={{ pt: 0.25 }}>
            <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
              {text}
            </Typography>

            <Button
              color={isOutgoing ? 'secondary' : 'primary'}
              variant="contained"
              onClick={() => navigate(`${ROUTES.MY_RESPONSES}/${senderId}`)}
              sx={{
                alignSelf: 'flex-start',
                py: 0.75,
                px: 2,
                borderRadius: '12px',
                boxShadow: 'none',
              }}
            >
              Посмотреть
            </Button>
          </Stack>
        )}

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1,
            width: '100%',
            alignItems: 'start',
            justifyContent: 'space-between',
          }}
        >
          {isEditing ? (
            <Stack spacing={1} sx={{ flex: 1, minWidth: 0, mt: hasMedia ? 0 : 0.25 }}>
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
                    handleCancelEdit()
                  }
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    bgcolor: isOutgoing
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'background.paper',
                    color: isOutgoing ? 'common.white' : 'text.primary',
                    fontSize: '0.875rem',
                    borderRadius: '12px',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: isOutgoing
                      ? 'rgba(255, 255, 255, 0.35)'
                      : 'divider',
                  },
                }}
              />

              {editError && (
                <Alert severity="error" sx={{ py: 0, fontSize: '0.75rem' }}>
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
                  sx={{ color: isOutgoing ? 'common.white' : 'text.secondary' }}
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
                      <CircularProgress size={14} color="inherit" />
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
                    lineHeight: 1.45,
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
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '0.9375rem',
                  }}
                >
                  {renderHighlightedText(text, highlight)}
                </Typography>
              )}
            </>
          )}
        </Stack>

        {!isEditing && !showMetaOverlay && (time || editedTimeLabel || isOutgoing) && (
          <MetaRow
            time={time}
            editedTimeLabel={editedTimeLabel}
            isOutgoing={isOutgoing}
            isRead={isRead}
          />
        )}
      </Box>

      <FullScreenImageViewer
        items={galleryImages}
        isOpen={galleryOpen}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box>
  )
}
