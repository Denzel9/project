import { Box, Link, Stack, Typography } from '@mui/material';

import {
  getActivityMediaFromPayload,
  TaskActivityType,
  type TaskActivityPayload,
} from '@/entities/task';
import { MediaItem } from '@/widgets/media';

type ActivityMediaViewProps = {
  type: TaskActivityType.MEDIA_ADDED | TaskActivityType.MEDIA_REMOVED;
  payload: TaskActivityPayload;
};

const isPreviewableMedia = (url: string, mimeType?: string) => {
  if (mimeType?.startsWith('image/') || mimeType?.startsWith('video/')) {
    return true
  }

  return /\.(jpe?g|png|gif|webp|bmp|svg|mp4|webm|mov|m4v|ogg|avi)(\?|$)/i.test(
    url,
  )
}

const getMediaFileName = (url: string, key?: string) => {
  if (key?.trim()) {
    const segments = key.split('/').filter(Boolean)
    return segments[segments.length - 1] ?? key
  }

  try {
    const parsedUrl = new URL(url)
    const segments = parsedUrl.pathname.split('/').filter(Boolean)
    return segments[segments.length - 1] ?? url
  } catch {
    return url
  }
}

export const ActivityMediaView = ({
  type,
  payload,
}: ActivityMediaViewProps) => {
  const media = getActivityMediaFromPayload(type, payload)

  return (
    <Stack
      spacing={1.5}
      sx={{ mt: 2 }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {type === TaskActivityType.MEDIA_ADDED
          ? 'Файл добавлен в материалы задачи.'
          : 'Файл удалён из материалов задачи.'}
      </Typography>

      {media ? (
        <>
          <Typography variant="body2">
            Файл:{' '}
            <Link
              href={media.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {getMediaFileName(media.url, media.key)}
            </Link>
          </Typography>

          {isPreviewableMedia(media.url, media.mimeType) && (
            <Box
              sx={{
                width: '100%',
                maxWidth: 480,
                height: { xs: 220, sm: 320 },
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: 'secondary.light',
              }}
            >
              <MediaItem
                src={media.url}
                alt={media.key ?? 'Медиа'}
                mimeType={media.mimeType}
                withControls
                loading="eager"
              />
            </Box>
          )}
        </>
      ) : (
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Файл: —
        </Typography>
      )}
    </Stack>
  )
}
