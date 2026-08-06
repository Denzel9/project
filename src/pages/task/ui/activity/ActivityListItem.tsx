import {
  AddPhotoAlternateOutlined,
  CancelOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SwapHorizOutlined,
} from '@mui/icons-material';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import {
  getTaskActivityMeta,
  getTaskActivitySummary,
  TaskActivityType,
  type TaskActivity,
} from '@/entities/task';
import { ActionActorCaption } from '@/shared';

type ActivityListItemProps = {
  activity: TaskActivity;
  onClick: () => void;
};

const ACTIVITY_ICONS = {
  [TaskActivityType.STATUS_CHANGED]: SwapHorizOutlined,
  [TaskActivityType.FIELD_UPDATED]: EditOutlined,
  [TaskActivityType.MEDIA_ADDED]: AddPhotoAlternateOutlined,
  [TaskActivityType.MEDIA_REMOVED]: DeleteOutlined,
  [TaskActivityType.ANNULMENT_REQUESTED]: CancelOutlined,
  [TaskActivityType.ANNULMENT_CONFIRMED]: CheckCircleOutlined,
} as const;

const formatFullDateTime = (createdAt: string) =>
  new Date(createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ActivityListItem = ({
  activity,
  onClick,
}: ActivityListItemProps) => {
  const meta = getTaskActivityMeta(activity.type);
  const Icon =
    ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] ?? EditOutlined;

  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.25,
        py: 1.25,
        cursor: 'pointer',
        borderRadius: '10px',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ alignItems: 'flex-start' }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            display: 'flex',
            flexShrink: 0,
            borderRadius: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            color: `${meta.color}.main`,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              gap: 1,
              mb: 0.25,
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="caption"
              color="primary"
              sx={{
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {meta.label}
            </Typography>

            <Tooltip title={formatFullDateTime(activity.createdAt)}>
              <Typography
                variant="caption"
                color="info"
                sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
              >
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                  locale: ru,
                })}
              </Typography>
            </Tooltip>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              mb: 0.25,
              lineHeight: 1.45,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {getTaskActivitySummary(activity)}
          </Typography>

          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
            <ActionActorCaption
              actor={activity}
              direction="row"
              spacing={0.5}
            />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
