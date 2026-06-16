import { MessageOutlined, Whatshot } from '@mui/icons-material';
import { Box, Chip, IconButton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';

import { FavoriteButton } from '@/widgets';

import type { Post } from '@/entities/post';

type PostSearchResultItemProps = {
  post: Post;
  highlightQuery: string;
  isFavorite: boolean;
  onOpen: (postId: string) => void;
  onOpenChat: (ownerId: string) => void;
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
          color: 'inherit',
          borderRadius: 0.5,
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

export const PostSearchResultItem = ({
  post,
  highlightQuery,
  isFavorite,
  onOpen,
  onOpenChat,
}: PostSearchResultItemProps) => (
  <Box
    onClick={() => onOpen(post.id)}
    sx={{
      py: 1,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      alignItems: 'start',
      cursor: 'pointer',
      bgcolor: 'transparent',
      '&:hover': {
        bgcolor: 'secondary.main',
      },
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600 }}
        >
          {renderHighlightedText(post.title, highlightQuery)}
        </Typography>

        {post.urgent && <Whatshot color="error" />}
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {format(new Date(post.createdAt), 'dd.MM.yyyy')}
      </Typography>
    </Stack>

    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'end',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Stack
        direction="column"
        spacing={1}
      >
        {post.chips.map(chip => (
          <Chip
            key={chip}
            size="small"
            label={chip}
          />
        ))}
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ height: 'fit-content' }}
        onClick={e => e.stopPropagation()}
      >
        <FavoriteButton
          postId={post.id}
          isFavorite={isFavorite}
        />

        <IconButton
          size="small"
          onClick={() => onOpenChat(post.ownerId)}
        >
          <MessageOutlined />
        </IconButton>
      </Stack>
    </Stack>
  </Box>
);
