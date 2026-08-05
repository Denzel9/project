import { Close } from '@mui/icons-material';
import {
  Box,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import {
  getTaskActivityActorParts,
  getTaskActivityDetail,
  TaskActivityType,
  type TaskActivity,
} from '@/entities/task';
import { ActionActorCaption } from '@/shared';

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

  const actorParts = activity
    ? getTaskActivityActorParts(
      activity.actorId,
      { ownerId, executorId },
      activity
    )
    : null;

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
            {actorParts ? <ActionActorCaption actor={activity} /> : null}
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

        {detail && activity && detail.variant === 'request' && (
          <Stack
            spacing={1.5}
            sx={{ mt: 3 }}
          >
            {detail.reason && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Причина
                </Typography>
                <Typography variant="body1">{detail.reason}</Typography>
              </Box>
            )}
            {detail.proposedFinalDate && (
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Новая дата
                </Typography>
                <Typography variant="body1">
                  {detail.proposedFinalDate}
                </Typography>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Dialog>
  );
};
