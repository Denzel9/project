import { Badge, Stack, Avatar, Typography } from '@mui/material';
import { format } from 'date-fns';

import { getMessagePreview, type ChatConversation } from '@/entities/chat';

export const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: ChatConversation;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const { peer, lastMessage, updatedAt, unreadCount } = conversation;
  const hasUnread = unreadCount > 0;
  const preview = lastMessage
    ? getMessagePreview(
        lastMessage.content,
        lastMessage.media ?? [],
        lastMessage.isRedirected,
      )
    : 'Нет сообщений';
  const timeLabel = format(new Date(updatedAt), 'HH:mm');

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
        bgcolor: isSelected ? 'primary.light' : 'secondary.light',
      }}
    >
      <Badge
        overlap="circular"
        invisible={!hasUnread}
        badgeContent={unreadCount > 99 ? '99+' : unreadCount}
        color="error"
        sx={{
          '& .MuiBadge-badge': {
            fontWeight: 600,
            fontSize: '0.65rem',
            minWidth: 18,
            height: 18,
          },
        }}
      >
        <Avatar
          src={peer.avatar ?? undefined}
          alt={peer.displayName}
        />
      </Badge>

      <Stack
        direction="column"
        spacing={0.5}
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

      <Typography
        variant="body2"
        sx={{
          flexShrink: 0,
          fontWeight: hasUnread ? 600 : 400,
          ...(isSelected && { color: 'common.white' }),
        }}
      >
        {timeLabel}
      </Typography>
    </Stack>
  );
};
