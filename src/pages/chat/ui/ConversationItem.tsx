import { Stack, Avatar, Typography } from '@mui/material';
import { format } from 'date-fns';

import type { ChatConversation } from '@/entities/chat';

export const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
}: {
  conversation: ChatConversation;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const { peer, lastMessage, updatedAt } = conversation;
  const preview = lastMessage?.content ?? 'Нет сообщений';
  const timeLabel = format(new Date(updatedAt), 'HH:mm');

  return (
    <Stack
      direction="row"
      spacing={2}
      onClick={onSelect}
      sx={{
        bgcolor: isSelected ? 'primary.light' : 'secondary.main',
        p: 2,
        borderRadius: '16px',
        width: '100%',
        mb: 1,
        cursor: 'pointer',
      }}
    >
      <Avatar
        src={peer.avatar ?? undefined}
        alt={peer.displayName}
      />
      <Stack
        direction="column"
        spacing={0.5}
        sx={{ minWidth: 0, flex: 1 }}
      >
        <Typography
          variant="body1"
          noWrap
        >
          {peer.displayName}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
        >
          {preview}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ flexShrink: 0 }}
      >
        {timeLabel}
      </Typography>
    </Stack>
  );
};
