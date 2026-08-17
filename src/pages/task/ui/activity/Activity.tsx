import { HistoryOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  TASK_ACTIVITY_LABELS,
  type TaskActivity,
  type TaskActivityType,
  type TaskAnnulment,
  type TaskDeadlineExtension,
} from '@/entities/task';

import { ActivityDetailDialog } from './ActivityDetailDialog';
import { ActivityFilterChips } from './ActivityFilterChips';
import { ActivityListItem } from './ActivityListItem';
import { RequestHistoryListItem, type RequestHistoryItem } from './RequestHistoryListItem';

type ActivityTab = 'activity' | 'requests';

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
  annulments?: TaskAnnulment[] | null;
  deadlineExtensions?: TaskDeadlineExtension[] | null;
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
  annulments,
  deadlineExtensions,
}: ActivityProps) => {
  const [tab, setTab] = useState<ActivityTab>('activity');
  const [selectedActivity, setSelectedActivity] = useState<TaskActivity | null>(
    null
  );

  const requestItems = useMemo<RequestHistoryItem[]>(
    () =>
      [
        ...(annulments ?? []).map(item => ({
          id: `annulment-${item.id}`,
          kind: 'annulment' as const,
          status: item.status,
          initiator: item.initiator,
          reason: item.reason,
          requestedAt: item.requestedAt,
        })),
        ...(deadlineExtensions ?? []).map(item => ({
          id: `deadline-${item.id}`,
          kind: 'deadline' as const,
          status: item.status,
          initiator: item.initiator,
          reason: item.reason,
          requestedAt: item.requestedAt,
          proposedFinalDate: item.proposedFinalDate,
        })),
      ].sort(
        (a, b) =>
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      ),
    [annulments, deadlineExtensions]
  );

  const emptyMessage = activityType
    ? `Нет событий типа «${TASK_ACTIVITY_LABELS[activityType]}»`
    : 'Пока нет активности';

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        maxHeight: '560px',
        p: 2,
        borderRadius: '32px',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          flexShrink: 0,
          mb: 2.5,
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={tab}
          onChange={(_, value: ActivityTab | null) => {
            if (value) setTab(value);
          }}
          sx={theme => ({
            flex: 1,
            p: '3px',
            minHeight: 40,
            bgcolor: alpha(theme.palette.text.primary, 0.04),
            borderRadius: '14px',
            '& .MuiToggleButtonGroup-grouped': {
              border: 0,
              margin: 0,
            },
            '& .MuiToggleButton-root': {
              flex: 1,
              gap: 0.75,
              py: 0.875,
              px: 1.25,
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.8125rem',
              letterSpacing: 0,
              textTransform: 'none',
              borderRadius: '11px !important',
              transition: 'all 0.18s ease',
              '&:hover': {
                bgcolor: alpha(theme.palette.text.primary, 0.04),
              },
              '&.Mui-selected': {
                color: 'text.primary',
                fontWeight: 600,
                bgcolor: 'background.paper',
                boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.06)}, 0 0 0 1px ${alpha(theme.palette.text.primary, 0.04)}`,
                '&:hover': {
                  bgcolor: 'background.paper',
                },
              },
            },
          })}
        >
          <ToggleButton value="activity">
            Активность
            {total > 0 && (
              <Typography
                component="span"
                variant="caption"
                sx={{
                  color: 'inherit',
                  opacity: tab === 'activity' ? 1 : 0.65,
                  fontWeight: 600,
                }}
              >
                {total}
              </Typography>
            )}
          </ToggleButton>
          <ToggleButton value="requests">
            Запросы
            {requestItems.length > 0 && (
              <Typography
                component="span"
                variant="caption"
                sx={{
                  color: 'inherit',
                  opacity: tab === 'requests' ? 1 : 0.65,
                  fontWeight: 600,
                }}
              >
                {requestItems.length}
              </Typography>
            )}
          </ToggleButton>
        </ToggleButtonGroup>

        {tab === 'activity' && (
          <ActivityFilterChips
            activityType={activityType}
            onChange={setActivityType}
          />
        )}
      </Stack>

      {tab === 'activity' && (
        <>
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
              <HistoryOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
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
        </>
      )}

      {tab === 'requests' && (
        <>
          {requestItems.length === 0 ? (
            <Stack
              spacing={1}
              sx={{ py: 4, alignItems: 'center', textAlign: 'center' }}
            >
              <HistoryOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Пока нет запросов
              </Typography>
            </Stack>
          ) : (
            <Box
              sx={{
                minHeight: 0,
                overflowY: 'auto',
                pr: 0.5,
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  pl: 0.5,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 18,
                    bottom: 18,
                    left: 15,
                    width: '1px',
                    bgcolor: 'divider',
                  },
                }}
              >
                <Stack spacing={0}>
                  {requestItems.map((item, index) => (
                    <RequestHistoryListItem
                      key={item.id}
                      item={item}
                      isLast={index === requestItems.length - 1}
                    />
                  ))}
                </Stack>
              </Box>
            </Box>
          )}
        </>
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
