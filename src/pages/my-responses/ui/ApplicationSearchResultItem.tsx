import { Box, Chip, Stack, Typography, type ReactNode } from '@mui/material';
import { format } from 'date-fns';

import {
  APPLICATION_STATUS_LABELS,
  type Application,
} from '@/entities/application';

type ApplicationSearchResultItemProps = {
  application: Application;
  highlightQuery: string;
  onOpen: (postId: string) => void;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedText = (text: string, highlight?: string): ReactNode => {
  const trimmedHighlight = highlight?.trim();

  if (!trimmedHighlight) {
    return text;
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'gi'),
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
    ),
  );
};

const getStatusColor = (status: Application['status']) => {
  if (status === 'ACCEPTED') return 'success';
  if (status === 'REJECTED') return 'error';
  if (status === 'WITHDRAWN') return 'default';
  return 'primary';
};

export const ApplicationSearchResultItem = ({
  application,
  highlightQuery,
  onOpen,
}: ApplicationSearchResultItemProps) => (
  <Box
    onClick={() => onOpen(application.postId)}
    sx={{
      py: 1,
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
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
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600 }}
      >
        {renderHighlightedText(
          application.post?.title ?? 'Пост',
          highlightQuery,
        )}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {format(new Date(application.createdAt), 'dd.MM.yyyy')}
      </Typography>
    </Stack>

    <Chip
      size="small"
      label={APPLICATION_STATUS_LABELS[application.status]}
      color={getStatusColor(application.status)}
      sx={{ alignSelf: 'flex-start' }}
    />
  </Box>
);
