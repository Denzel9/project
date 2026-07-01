import { HistoryOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  TASK_ACTIVITY_LABELS,
  useAllTaskActivitiesInfiniteQuery,
  type Task,
  type TaskActivityType,
} from '@/entities';
import { ActivityDetailDialog } from '@/pages/task/ui/activity/ActivityDetailDialog';
import { ActivityFilterChips } from '@/pages/task/ui/activity/ActivityFilterChips';

import { DASHBOARD_ACTIVITY_ITEMS_LIMIT } from '../model/constants';
import {
  getDashboardTaskOptions,
  mapActivityFeedItem,
  type DashboardActivityItem,
} from '../model/utils';

import { DashboardActivityListItem } from './DashboardActivityListItem';

type DashboardActivityPanelProps = {
  tasks?: Task[];
};

export const DashboardActivityPanel = ({
  tasks = [],
}: DashboardActivityPanelProps) => {
  const [activityType, setActivityType] = useState<
    TaskActivityType | undefined
  >();
  const [taskId, setTaskId] = useState('all');
  const [selectedItem, setSelectedItem] =
    useState<DashboardActivityItem | null>(null);

  const taskMap = useMemo(
    () => new Map(tasks.map(task => [task.id, task])),
    [tasks]
  );

  const taskOptions = useMemo(() => getDashboardTaskOptions(tasks), [tasks]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useAllTaskActivitiesInfiniteQuery({
      limit: DASHBOARD_ACTIVITY_ITEMS_LIMIT,
      ...(activityType && { type: activityType }),
      ...(taskId !== 'all' && { taskId }),
    });

  const items = useMemo(
    () =>
      (data?.pages.flatMap(page => page.items) ?? []).map(item =>
        mapActivityFeedItem(item, taskMap)
      ),
    [data?.pages, taskMap]
  );

  const total = data?.pages[0]?.total ?? 0;
  const hasActiveFilters = Boolean(activityType) || taskId !== 'all';

  const selectedTaskTitle = useMemo(
    () => taskOptions.find(task => task.id === taskId)?.title,
    [taskId, taskOptions]
  );

  const emptyMessage = useMemo(() => {
    if (activityType) {
      return `Нет событий типа «${TASK_ACTIVITY_LABELS[activityType]}»`;
    }

    if (taskId !== 'all') {
      return 'Нет активности по выбранной задаче';
    }

    return 'Пока нет активности';
  }, [activityType, taskId]);

  const handleResetFilters = () => {
    setActivityType(undefined);
    setTaskId('all');
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '600px',
        display: 'flex',
        bgcolor: 'white',
        overflow: 'hidden',
        p: { xs: 2, md: 2.5 },
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          Активность
        </Typography>

        {!isLoading && total > 0 && (
          <Chip
            size="small"
            variant="outlined"
            label={`${items.length} из ${total}`}
          />
        )}
      </Stack>

      <Box
        sx={{
          mb: 1.5,
          p: 1.25,
          flexShrink: 0,
          borderRadius: '16px',
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <ActivityFilterChips
            activityType={activityType}
            onChange={setActivityType}
          />

          <TextField
            select
            fullWidth
            size="small"
            label="Задача"
            value={taskId}
            onChange={event => setTaskId(event.target.value)}
            sx={{ minWidth: 0 }}
          >
            <MenuItem value="all">Все задачи</MenuItem>
            {taskOptions.map(task => (
              <MenuItem
                key={task.id}
                value={task.id}
              >
                {task.title}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {hasActiveFilters && (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ mt: 1.25, flexWrap: 'wrap', gap: 0.75 }}
          >
            {activityType && (
              <Chip
                size="small"
                label={TASK_ACTIVITY_LABELS[activityType]}
                onDelete={() => setActivityType(undefined)}
              />
            )}

            {taskId !== 'all' && selectedTaskTitle && (
              <Chip
                size="small"
                label={selectedTaskTitle}
                onDelete={() => setTaskId('all')}
              />
            )}

            <Chip
              size="small"
              variant="outlined"
              label="Сбросить"
              onClick={handleResetFilters}
            />
          </Stack>
        )}
      </Box>

      {isLoading && items.length === 0 && (
        <Stack spacing={1}>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={72}
              sx={{ borderRadius: '14px' }}
            />
          ))}
        </Stack>
      )}

      {!isLoading && items.length === 0 && (
        <Stack
          spacing={1}
          sx={{ py: 5, alignItems: 'center', textAlign: 'center' }}
        >
          <HistoryOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {emptyMessage}
          </Typography>
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={handleResetFilters}
            >
              Сбросить фильтры
            </Button>
          )}
        </Stack>
      )}

      {items.length > 0 && (
        <Box
          sx={{
            minHeight: 0,
            flex: 1,
            overflowY: 'auto',
            pr: 0.25,
          }}
        >
          <Stack spacing={1}>
            {items.map(item => (
              <DashboardActivityListItem
                key={item.activity.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </Stack>

          {hasNextPage && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
              <Button
                size="small"
                variant="text"
                disabled={isFetchingNextPage}
                onClick={() => void fetchNextPage()}
              >
                {isFetchingNextPage ? (
                  <CircularProgress size={16} />
                ) : (
                  'Показать ещё'
                )}
              </Button>
            </Box>
          )}
        </Box>
      )}

      <ActivityDetailDialog
        activity={selectedItem?.activity ?? null}
        ownerId={selectedItem?.task.ownerId ?? ''}
        executorId={selectedItem?.task.executorId}
        onClose={() => setSelectedItem(null)}
      />
    </Box>
  );
};
