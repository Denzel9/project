import { HistoryOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import {
  TASK_ACTIVITY_LABELS,
  type TaskActivity,
  type TaskActivityType,
} from '@/entities/task';

import { ActivityDetailDialog } from './activity/ActivityDetailDialog';
import { ActivityFilterChips } from './activity/ActivityFilterChips';
import { ActivityListItem } from './activity/ActivityListItem';

type ActivityProps = {
  total: number;
  isLoading: boolean;
  ownerId: string;
  hasMore?: boolean;
  executorId?: string | null;
  activities: TaskActivity[];
  activityType?: TaskActivityType;
  onLoadMore?: () => void;
  setActivityType: (type?: TaskActivityType) => void;
};

export const Activity = ({
  total,
  isLoading,
  ownerId,
  hasMore,
  executorId,
  activities,
  activityType,
  onLoadMore,
  setActivityType,
}: ActivityProps) => {
  const [selectedActivity, setSelectedActivity] = useState<TaskActivity | null>(
    null,
  );

  const emptyMessage = activityType
    ? `Нет событий типа «${TASK_ACTIVITY_LABELS[activityType]}»`
    : 'Пока нет активности';

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        bgcolor: 'white',
        overflow: 'hidden',
        maxHeight: '560px',
        p: { xs: 2.5, md: 3 },
        borderRadius: '32px',
        flexDirection: 'column',
      }}
    >
      <Stack
        spacing={1.5}
        sx={{ flexShrink: 0, mb: 2 }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >
          <Typography variant="h6">
            Активность
            {total > 0 && (
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                ({total})
              </Typography>
            )}
          </Typography>

          <ActivityFilterChips
            activityType={activityType}
            onChange={setActivityType}
          />
        </Stack>
      </Stack>

      {isLoading && activities.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!isLoading && activities.length === 0 && (
        <Stack
          spacing={1}
          sx={{ py: 4, alignItems: 'center', textAlign: 'center' }}
        >
          <HistoryOutlined
            sx={{ fontSize: 40, color: 'text.disabled' }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {emptyMessage}
          </Typography>
          {activityType && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              Попробуйте сбросить фильтр
            </Typography>
          )}
        </Stack>
      )}

      {activities.length > 0 && (
        <Box
          sx={{
            minHeight: 0,
            overflowY: 'auto',
            pr: 0.5,
          }}
        >
          <Stack spacing={1}>
            {activities.map(activity => (
              <ActivityListItem
                key={activity.id}
                activity={activity}
                ownerId={ownerId}
                executorId={executorId}
                onClick={() => setSelectedActivity(activity)}
              />
            ))}
          </Stack>

          {hasMore && onLoadMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                size="small"
                variant="outlined"
                disabled={isLoading}
                onClick={onLoadMore}
              >
                {isLoading ? 'Загрузка…' : 'Показать ещё'}
              </Button>
            </Box>
          )}
        </Box>
      )}

      <ActivityDetailDialog
        activity={selectedActivity}
        ownerId={ownerId}
        executorId={executorId}
        onClose={() => setSelectedActivity(null)}
      />
    </Box>
  );
};
