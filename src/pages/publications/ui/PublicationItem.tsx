import { OpenInNewOutlined, ScheduleOutlined } from '@mui/icons-material';
import { Box, Button, Chip, Divider, Stack, Tooltip, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router';

import { getPlatformLabel } from '@/entities/post';
import {
  executorToUserPartial,
  UserDisplayName,
  type User,
} from '@/entities/user';
import { Media } from '@/widgets';

import {
  getPublicationGalleryMediaItems,
  getPublicationPlatforms,
  getPublicationTaskPath,
  getPublicationTitle,
} from '../model/utils';

import type { Publication } from '@/entities/publication';

type PublicationItemProps = {
  publication: Publication;
};

export const PublicationItem = ({ publication }: PublicationItemProps) => {
  const title = getPublicationTitle(publication);
  const taskPath = getPublicationTaskPath(publication);
  const mediaItems = getPublicationGalleryMediaItems(publication);
  const participantUser = publication.executor
    ? executorToUserPartial(publication.executor)
    : (publication.owner as Partial<User>);

  const platformChips = getPublicationPlatforms(publication);

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '24px',
        overflow: 'hidden',
      }}
    >
      {mediaItems.length > 0 ? (
        <Box
          sx={{
            aspectRatio: '16 / 10',
            bgcolor: 'grey.100',
            overflow: 'hidden',
            '& > .MuiStack-root': {
              height: '100%',
            },
          }}
        >
          <Media
            items={mediaItems}
            withThumbnails={false}
          />
        </Box>
      ) : (
        <Box
          sx={{
            aspectRatio: '16 / 10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            color: 'text.disabled',
          }}
        >
          <Typography variant="body2">Нет медиа</Typography>
        </Box>
      )}

      <Stack
        sx={{
          flex: 1,
          p: 2,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          spacing={1.5}
          sx={{ flex: 1, minHeight: 0 }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {title}
            </Typography>
          </Stack>

          {publication.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                whiteSpace: 'pre-wrap',
              }}
            >
              {publication.description}
            </Typography>
          )}

          <Box
            sx={{
              px: 1.5,
              py: 1.25,
              borderRadius: '14px',
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center' }}
              >
                <ScheduleOutlined
                  sx={{ fontSize: 18, color: 'text.secondary' }}
                />
                <Typography variant="body2">
                  {formatDistanceToNow(new Date(publication.publishedAt), {
                    addSuffix: true,
                    locale: ru,
                  })}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Участник:
                </Typography>
                <UserDisplayName
                  user={participantUser}
                  variant="body2"
                />
              </Stack>
            </Stack>
          </Box>

          {platformChips.length > 0 && (
            <Tooltip
              title={platformChips.map(getPlatformLabel).join(', ')}
            >
              <Chip
                size="small"
                label={platformChips.length}
              />
            </Tooltip>
          )}
        </Stack>

        <Box sx={{ flexShrink: 0, pt: 1.5 }}>
          <Divider sx={{ mb: 1.5 }} />

          <Stack
            direction="row"
            spacing={1}
            sx={{ flexWrap: 'wrap', gap: 1 }}
          >
            <Button
              component={Link}
              to={taskPath}
              variant="outlined"
              size="small"
            >
              К задаче
            </Button>

            {publication.externalUrl && (
              <Button
                href={publication.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="small"
                endIcon={<OpenInNewOutlined />}
              >
                Открыть публикацию
              </Button>
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
