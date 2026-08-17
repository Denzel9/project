import { Stack, Box } from '@mui/material';

import { MediaItem } from './MediaItem';

import type { TaskMedia } from '@/entities/task';

type MediaPreviewProps = {
  media: TaskMedia[];
};

export const MediaPreview = ({ media }: MediaPreviewProps) => {
  const visible = media.slice(0, 5)
  const restCount = media.length - visible.length

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        width: '100%',
      }}
    >
      {visible.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            width: '50px',
            height: '50px',
            ml: index > 0 ? '-20px !important' : 0,
            borderRadius: '16px',
            border: theme => `1px solid ${theme.palette.secondary.main}`,
          }}
        >
          <MediaItem
            src={item.url}
            alt={item.key}
            mimeType={item.mimeType}
          />
        </Box>
      ))}
      {restCount > 0 && (
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
          +{restCount}
        </Box>
      )}
    </Stack>
  )
}
