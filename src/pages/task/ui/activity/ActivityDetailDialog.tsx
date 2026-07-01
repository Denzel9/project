import { Close } from '@mui/icons-material';
import {
  Box,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import {
  getTaskActivityActorLabel,
  getTaskActivityDetail,
  TaskActivityType,
  type TaskActivity,
} from '@/entities/task';

import { ActivityFieldDiffView } from './ActivityFieldDiffView';
import { ActivityMediaView } from './ActivityMediaView';
import { ActivityStatusChangeView } from './ActivityStatusChangeView';

type ActivityDetailDialogProps = {
  activity: TaskActivity | null;
  ownerId: string;
  executorId?: string | null;
  onClose: () => void;
};

const formatFullDateTime = (createdAt: string) =>
  new Date(createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ActivityDetailDialog = ({
  activity,
  ownerId,
  executorId,
  onClose,
}: ActivityDetailDialogProps) => {
  const isOpen = Boolean(activity);
  const detail = activity ? getTaskActivityDetail(activity) : null;

  const actorLabel = activity
    ? getTaskActivityActorLabel(activity.actorId, { ownerId, executorId })
    : '';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '32px',
          maxHeight: '90vh',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        color="primary"
        sx={{
          top: 0,
          right: -60,
          position: 'absolute',
          bgcolor: 'secondary.main',
          ':hover': { bgcolor: 'secondary.light' },
        }}
      >
        <Close />
      </IconButton>

      <Box
        sx={{
          p: { xs: 2.5, md: 4 },
          overflowY: 'auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          {detail?.title}
        </Typography>

        {activity && (
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {formatFullDateTime(activity.createdAt)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              ·
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {actorLabel}
            </Typography>
          </Stack>
        )}

        {detail && activity && detail.variant === 'status' && (
          <ActivityStatusChangeView
            from={detail.from}
            to={detail.to}
          />
        )}

        {detail && activity && detail.variant === 'field' && detail.showDiff && (
          <ActivityFieldDiffView
            field={detail.field}
            from={detail.from}
            to={detail.to}
            isOpen={isOpen}
          />
        )}

        {detail &&
          activity &&
          detail.variant === 'media' &&
          (activity.type === TaskActivityType.MEDIA_ADDED ||
            activity.type === TaskActivityType.MEDIA_REMOVED) && (
            <ActivityMediaView
              type={activity.type}
              payload={activity.payload}
            />
          )}
      </Box>
    </Dialog>
  );
};
