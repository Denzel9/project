import { MoreVert, PushPin, } from '@mui/icons-material';
import {
  Badge,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import { format } from 'date-fns';
import { useState, type MouseEvent } from 'react';

import {
  getMessagePreview,
  usePinConversationMutation,
  type ChatConversation,
} from '@/entities/chat';

export const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: ChatConversation;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(null);
  const { peer, lastMessage, updatedAt, unreadCount, isPinned } = conversation;
  const hasUnread = unreadCount > 0;
  const preview = lastMessage
    ? getMessagePreview(
      lastMessage.content,
      lastMessage.media ?? [],
      lastMessage.isRedirected
    )
    : 'Нет сообщений';
  const timeLabel = format(new Date(updatedAt), 'HH:mm');

  const { mutateAsync: pinConversation } =
    usePinConversationMutation();

  const handleTogglePin = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    pinConversation({
      conversationId: conversation.id,
      isPinned: !isPinned,
    }).then(() => {
      setIsMoreMenuOpen(false);
    });
  };

  const handleMore = (event: MouseEvent<HTMLButtonElement>) => {
    setMoreMenuAnchorEl(event.currentTarget);
    setIsMoreMenuOpen(true);
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      onClick={onSelect}
      sx={{
        mb: 1,
        p: 2,
        width: '100%',
        cursor: 'pointer',
        borderRadius: '16px',
        bgcolor: isSelected
          ? 'primary.light'
          : isPinned
            ? 'action.hover'
            : 'secondary.light',
      }}
    >
      <Badge
        overlap="circular"
        invisible={!hasUnread}
        badgeContent={unreadCount > 99 ? '99+' : unreadCount}
        color="error"
      >
        <Avatar
          alt={peer.displayName}
          src={peer.avatar ?? undefined}
        />
      </Badge>

      <Stack
        spacing={0.5}
        direction="column"
        sx={{ minWidth: 0, flex: 1 }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: hasUnread ? 700 : 500,
            ...(isSelected && { color: 'common.white' }),
          }}
        >
          {peer.displayName}
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

      <Stack
        spacing={0.5}
        sx={{ alignItems: 'flex-end', flexShrink: 0 }}
      >
        <IconButton
          size="small"
          aria-label="Ещё"
          onClick={handleMore}
          onMouseDown={event => event.stopPropagation()}
          sx={{
            p: 0.5,
          }}
        >
          <MoreVert sx={{ fontSize: 18, color: 'white' }} color="action" />
        </IconButton>

        <Menu
          anchorEl={moreMenuAnchorEl}
          open={isMoreMenuOpen}
          onClose={() => setIsMoreMenuOpen(false)}
        >
          <MenuItem onClick={handleTogglePin}>{isPinned ? 'Открепить' : 'Закрепить'}</MenuItem>
        </Menu>

        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {isPinned && <Tooltip title={isPinned ? 'Открепить' : 'Закрепить'}>
            <PushPin sx={{ fontSize: 16, color: 'white' }} />
          </Tooltip>}

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
  );
};
