import { Stack, Box } from '@mui/material';

import { MediaItem } from './MediaItem';

import type { TaskMedia } from '@/entities/task';

type MediaPreviewProps = {
  media: TaskMedia[];
};

export const MediaPreview = ({ media }: MediaPreviewProps) => {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        width: '100%',
      }}
    >
      {media.map((media, index) => (
        <Box
          key={media.id}
          sx={{
            width: '50px',
            height: '50px',
            ml: index > 0 ? '-20px !important' : 0,
            borderRadius: '16px',
            border: theme => `1px solid ${theme.palette.secondary.main}`,
          }}
        >
          <MediaItem
            key={media.id}
            src={media.url}
            alt={media.key}
            mimeType={media.mimeType}
          />
        </Box>
      ))}
      {media.length > 5 && (
        <Box
          sx={{
            width: '50px',
            height: '50px',
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            ml: '-20px !important',
            zIndex: 1,
          }}
        >
          +{media.length - 5}
        </Box>
      )}
    </Stack>
  );
};
