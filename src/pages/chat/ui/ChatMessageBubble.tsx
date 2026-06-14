import { Box, Stack, Typography } from '@mui/material';

import { MediaItem } from '@/widgets/media/ui/MediaItem';

import type { MessageSide } from '../model/types';
import type { ChatMessageMedia } from '@/entities/chat';

type ChatMessageBubbleProps = {
  text: string;
  media?: ChatMessageMedia[];
  side: MessageSide;
  time?: string;
  highlight?: string;
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
  text,
  media = [],
  side,
  time,
  highlight,
}: ChatMessageBubbleProps) => {
  const isOutgoing = side === 'outgoing';
  const hasText = Boolean(text.trim());

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
      {media.length > 0 && (
        <Stack
          spacing={1}
          sx={{ mb: hasText ? 1 : 0 }}
        >
          {media.map(item => (
            <Box
              key={item.key}
              sx={{
                borderRadius: '12px',
                overflow: 'hidden',
                maxWidth: 280,
              }}
              onClick={e => e.stopPropagation()}
            >
              <MediaItem
                src={item.url}
                alt="Вложение"
                mimeType={item.mimeType}
              />
            </Box>
          ))}
        </Stack>
      )}

      {hasText && (
        <Typography variant="body1">
          {renderHighlightedText(text, highlight)}
        </Typography>
      )}

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
