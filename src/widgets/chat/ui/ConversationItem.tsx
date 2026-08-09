import { MoreVert, PushPin, StickyNote2 } from '@mui/icons-material'
import {
  Badge,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material'
import { useState, type MouseEvent } from 'react'

import {
  formatConversationListDayLabel,
  getMessagePreview,
  useMarkConversationDialogUnreadMutation,
  usePinConversationMutation,
  type ChatConversation,
} from '@/entities/chat'

export const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
  showActions = true,
  showPinIcon = true,
}: {
  conversation: ChatConversation
  isSelected: boolean
  onSelect: () => void
  showActions?: boolean
  showPinIcon?: boolean
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false)
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(
    null,
  )
  const {
    peer,
    lastMessage,
    updatedAt,
    unreadCount,
    isPinned,
    isNotes,
    isMarkedUnread = false,
  } = conversation
  const displayName = isNotes ? 'Заметки' : peer.displayName
  const hasMessageUnread = unreadCount > 0
  const showUnreadDot = !hasMessageUnread && isMarkedUnread
  const hasUnread = hasMessageUnread || isMarkedUnread
  const canMarkDialogUnread =
    Boolean(conversation.id) && !hasMessageUnread && !isMarkedUnread
  const preview = lastMessage
    ? getMessagePreview(
        lastMessage.content,
        lastMessage.media ?? [],
        lastMessage.isRedirected,
      )
    : 'Нет сообщений'
  const timeLabel = formatConversationListDayLabel(
    lastMessage?.createdAt ?? updatedAt,
  )

  const { mutateAsync: pinConversation } = usePinConversationMutation()
  const { mutateAsync: markDialogUnread, isPending: isMarkingUnread } =
    useMarkConversationDialogUnreadMutation()

  const handleTogglePin = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    void pinConversation({
      conversationId: conversation.id,
      isPinned: !isPinned,
    }).then(() => {
      setIsMoreMenuOpen(false)
    })
  }

  const handleMarkUnread = (event: MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()

    if (!canMarkDialogUnread || isMarkingUnread) {
      return
    }

    void markDialogUnread(conversation.id).then(() => {
      setIsMoreMenuOpen(false)
    })
  }

  const handleMore = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setMoreMenuAnchorEl(event.currentTarget)
    setIsMoreMenuOpen(true)
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      onClick={onSelect}
      sx={{
        mb: 1,
        p: 2,
        alignItems: 'center',
        width: '100%',
        cursor: 'pointer',
        borderRadius: '16px',
        bgcolor: isSelected
          ? 'primary.light'
          : isPinned && showPinIcon
            ? 'action.hover'
            : 'secondary.light',
      }}
    >
      <Badge
        overlap="circular"
        invisible={!hasUnread}
        variant={showUnreadDot ? 'dot' : 'standard'}
        badgeContent={
          showUnreadDot ? undefined : unreadCount > 99 ? '99+' : unreadCount
        }
        color="error"
        sx={
          showUnreadDot
            ? {
                '& .MuiBadge-badge': {
                  minWidth: 10,
                  height: 10,
                  borderRadius: '50%',
                },
              }
            : undefined
        }
      >
        {isNotes ? (
          <Avatar
            alt={displayName}
            sx={{
              width: 48,
              height: 48,
              bgcolor: isSelected ? 'common.white' : 'primary.main',
              color: isSelected ? 'primary.main' : 'common.white',
            }}
          >
            <StickyNote2 />
          </Avatar>
        ) : (
          <Avatar
            alt={displayName}
            src={peer.avatar ?? undefined}
            sx={{
              width: 48,
              height: 48,
            }}
          />
        )}
      </Badge>

      <Stack spacing={0.5} direction="column" sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body1"
          sx={{
            fontWeight: hasUnread ? 700 : 500,
            ...(isSelected && { color: 'common.white' }),
          }}
        >
          {displayName}
        </Typography>

        <Typography
          variant="body2"
          noWrap
          sx={{
            fontWeight: hasUnread ? 600 : 400,
            ...(isSelected && { color: 'common.white' }),
          }}
        >
          {preview}
        </Typography>
      </Stack>

      <Stack spacing={0.5} sx={{ alignItems: 'flex-end', flexShrink: 0 }}>
        {showActions && (
          <>
            <IconButton
              size="small"
              aria-label="Ещё"
              onClick={handleMore}
              onMouseDown={e => e.stopPropagation()}
              sx={{
                p: 0.5,
              }}
            >
              <MoreVert
                sx={{
                  fontSize: 18,
                  color: isSelected ? 'common.white' : 'action',
                }}
                color="action"
              />
            </IconButton>

            <Menu
              anchorEl={moreMenuAnchorEl}
              open={isMoreMenuOpen}
              onClose={() => setIsMoreMenuOpen(false)}
              onClick={event => event.stopPropagation()}
            >
              <MenuItem onClick={handleTogglePin}>
                {isPinned ? 'Открепить' : 'Закрепить'}
              </MenuItem>
              {canMarkDialogUnread && (
                <MenuItem
                  disabled={isMarkingUnread}
                  onClick={handleMarkUnread}
                >
                  Пометить непрочитанным
                </MenuItem>
              )}
            </Menu>
          </>
        )}

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {showPinIcon && isPinned && (
            <Tooltip title={isPinned ? 'Открепить' : 'Закрепить'}>
              <PushPin
                sx={{
                  fontSize: 16,
                  color: isSelected ? 'common.white' : 'action',
                }}
              />
            </Tooltip>
          )}

          <Typography
            variant="body2"
            sx={{
              fontWeight: hasUnread ? 600 : 400,
              ...(isSelected && { color: 'common.white' }),
            }}
          >
            {timeLabel}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}
