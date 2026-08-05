import { AttachFile } from '@mui/icons-material';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router';

import { canManageComment } from '@/entities/task';
import { ActionActorCaption } from '@/shared';
import { MediaItem } from '@/widgets/media';

import {
  getCommentPreview,
  getDashboardCommentPath,
  type DashboardCommentItem,
} from '../model/utils';

type DashboardCommentListItemProps = {
  highlight?: string;
  item: DashboardCommentItem;
  currentUserId: string | null;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatFullDateTime = (createdAt: string) =>
  new Date(createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const CommentPreview = ({
  preview,
  highlight,
  isOwn,
}: {
  preview: string;
  highlight?: string;
  isOwn: boolean;
}) => (
  <Typography
    variant="body2"
    sx={{
      lineHeight: 1.55,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    }}
  >
    {highlight ? (
      <>
        {preview
          .split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'))
          .map((part, index) =>
            part.toLowerCase() === highlight.toLowerCase() ? (
              <Box
                key={`${part}-${index}`}
                component="mark"
                sx={{
                  px: 0.25,
                  borderRadius: 0.5,
                  color: 'inherit',
                  bgcolor: isOwn ? 'rgba(255,255,255,0.28)' : 'warning.light',
                }}
              >
                {part}
              </Box>
            ) : (
              part
            )
          )}
      </>
    ) : (
      preview
    )}
  </Typography>
);

const CommentMediaPreview = ({
  media,
}: {
  media: NonNullable<DashboardCommentItem['comment']['media']>;
}) => (
  <Stack
    direction="row"
    spacing={0.75}
    sx={{ mt: 1, flexWrap: 'wrap' }}
  >
    {media.map(item => (
      <Box
        key={item.key}
        sx={{
          width: 72,
          height: 72,
          flexShrink: 0,
          overflow: 'hidden',
          borderRadius: '10px',
        }}
      >
        <MediaItem
          src={item.url}
          alt="Вложение"
          mimeType={item.mimeType}
          fileName={item.key.split('/').pop()}
        />
      </Box>
    ))}
  </Stack>
);

export const DashboardCommentListItem = ({
  item,
  highlight,
  currentUserId,
}: DashboardCommentListItemProps) => {
  const { comment } = item;
  const preview = getCommentPreview(comment);
  const commentPath = getDashboardCommentPath(item);
  const media = comment.media ?? [];
  const hasMedia = media.length > 0;
  const isOwn = canManageComment(comment.authorId, currentUserId);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
      }}
    >
      <Box
        component={Link}
        to={commentPath}
        sx={{
          px: 1.5,
          py: 1.25,
          display: 'block',
          borderColor: 'divider',
          textDecoration: 'none',
          boxShadow: isOwn ? 1 : 0,
          transition: 'opacity 0.2s',
          maxWidth: { xs: '88%', sm: '75%' },
          border: isOwn ? 'none' : '1px solid',
          bgcolor: isOwn ? 'primary.main' : 'background.paper',
          color: isOwn ? 'primary.contrastText' : 'text.primary',
          borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          '&:hover': {
            opacity: 0.92,
          },
        }}
      >
        {comment.actorDisplayName || comment.actorKind ? (
          <Box sx={{ mb: 0.5 }}>
            <ActionActorCaption
              actor={comment}
            />
          </Box>
        ) : null}

        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            gap: 0.5,
            flexWrap: 'wrap',
            alignItems: 'center',
            mb: hasMedia || preview ? 0.5 : 0,
          }}
        >
          {hasMedia && (
            <Chip
              size="small"
              icon={<AttachFile sx={{ fontSize: '14px !important' }} />}
              label={media.length}
              variant="outlined"
              sx={{
                height: 22,
                ...(isOwn && {
                  color: 'inherit',
                  borderColor: 'rgba(255,255,255,0.4)',
                }),
              }}
            />
          )}

          <Tooltip title={formatFullDateTime(comment.createdAt)}>
            <Typography
              variant="caption"
              sx={{
                ml: 'auto',
                opacity: 0.8,
                color: isOwn ? 'inherit' : 'text.secondary',
              }}
            >
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
                locale: ru,
              })}
            </Typography>
          </Tooltip>
        </Stack>

        {preview && (
          <CommentPreview
            preview={preview}
            highlight={highlight}
            isOwn={isOwn}
          />
        )}

        {hasMedia && <CommentMediaPreview media={media} />}

        <Typography
          variant="caption"
          sx={{
            mt: 0.75,
            display: 'block',
            opacity: 0.65,
            textAlign: isOwn ? 'right' : 'left',
            color: isOwn ? 'inherit' : 'text.secondary',
          }}
        >
          {format(new Date(comment.createdAt), 'HH:mm')}
        </Typography>
      </Box>
    </Box>
  );
};
