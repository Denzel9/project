import {
  AddPhotoAlternateOutlined,
  CancelOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  SwapHorizOutlined,
} from '@mui/icons-material';
import { Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
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
  const Icon = ACTIVITY_ICONS[activity.type as keyof typeof ACTIVITY_ICONS] ?? EditOutlined;

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1.5,
        cursor: 'pointer',
        borderRadius: '16px',
        bgcolor: 'secondary.light',
        transition: 'background-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
          boxShadow: 1,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: 'flex-start' }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            display: 'flex',
            flexShrink: 0,
            borderRadius: '12px',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'white',
            color: `${meta.color}.main`,
          }}
        >
          <Icon fontSize="small" />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              mb: 0.5,
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 0.75,
            }}
          >
            <Chip
              size="small"
              color={meta.color}
              label={meta.label}
            />

            <ActionActorCaption
              direction="row"
              spacing={0.5}
            />

            <Tooltip title={formatFullDateTime(activity.createdAt)}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 'auto' }}
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
              wordBreak: 'break-word',
              lineHeight: 1.5,
            }}
          >
            {getTaskActivitySummary(activity)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
