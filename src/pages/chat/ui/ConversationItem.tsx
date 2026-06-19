import { Stack, Avatar, Typography } from '@mui/material';
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
  const { peer, lastMessage, updatedAt } = conversation;
  const preview = lastMessage
    ? getMessagePreview(lastMessage.content, lastMessage.media ?? [])
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
        bgcolor: isSelected ? 'primary.light' : 'secondary.main',
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
          sx={{ ...(isSelected && { color: 'common.white' }) }}
        >
          {peer.displayName}
        </Typography>
        <Typography
          variant="body2"
          sx={{ ...(isSelected && { color: 'common.white' }) }}
        >
          {preview}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{ ...(isSelected && { color: 'common.white' }) }}
      >
        {timeLabel}
      </Typography>
    </Stack>
  );
};
