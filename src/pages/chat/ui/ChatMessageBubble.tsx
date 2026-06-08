import { Box, Typography } from '@mui/material';

import type { MessageSide } from '../model/types';

type ChatMessageBubbleProps = {
  text: string;
  side: MessageSide;
  time?: string;
};

export const ChatMessageBubble = ({ text, side, time }: ChatMessageBubbleProps) => {
  const isOutgoing = side === 'outgoing';

  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        maxWidth: '70%',
        borderRadius: '16px',
        alignSelf: isOutgoing ? 'flex-end' : 'flex-start',
        bgcolor: isOutgoing ? 'primary.main' : 'common.white',
        color: isOutgoing ? 'common.white' : 'text.primary',
        boxShadow: isOutgoing ? 0 : 1,
      }}
    >
      <Typography variant="body1">{text}</Typography>
      {time && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            opacity: 0.8,
            textAlign: isOutgoing ? 'right' : 'left',
          }}
        >
          {time}
        </Typography>
      )}
    </Box>
  );
};
