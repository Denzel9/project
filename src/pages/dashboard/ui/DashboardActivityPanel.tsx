import { FilterList, HistoryOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import {
  TASK_ACTIVITY_LABELS,
  useAllTaskActivitiesInfiniteQuery,
  useTasksQuery,
  type Task,
  type TaskActivityType,
} from '@/entities';
import { ActivityDetailDialog } from '@/pages/task/ui/activity/ActivityDetailDialog';
import { EmptyBlock } from '@/shared';

import { DASHBOARD_ACTIVITY_PAGE_SIZE } from '../model/constants';
import {
  getDashboardTaskOptions,
  mapActivityFeedItem,
  type DashboardActivityItem,
} from '../model/utils';

import { DashboardActivityListItem } from './DashboardActivityListItem';

const ACTIVITY_FILTER_TASKS_LIMIT = 20;

export const DashboardActivityPanel = () => {
  const [activityType, setActivityType] = useState<
    TaskActivityType | undefined
  >();
  const [taskId, setTaskId] = useState('all');
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [visibleCount, setVisibleCount] = useState(
    DASHBOARD_ACTIVITY_PAGE_SIZE
  );
  const [selectedItem, setSelectedItem] =
    useState<DashboardActivityItem | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useAllTaskActivitiesInfiniteQuery({
      limit: DASHBOARD_ACTIVITY_PAGE_SIZE,
      ...(activityType && { type: activityType }),
      ...(taskId !== 'all' && { taskId }),
    });

  const { data: tasksData } = useTasksQuery({
    page: 1,
    limit: ACTIVITY_FILTER_TASKS_LIMIT,
  });

  const feedItems = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages]
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();

    tasksData?.items.forEach(task => {
      map.set(task.id, task);
    });

    feedItems.forEach(item => {
      const existing = map.get(item.taskId);
      const embedded = item.task;

      if (embedded) {
        map.set(item.taskId, {
          id: embedded.id,
          title: embedded.title || existing?.title || '',
          ownerId: embedded.ownerId || existing?.ownerId || '',
          executorId: embedded.executorId ?? existing?.executorId ?? '',
          postId: embedded.postId ?? existing?.postId ?? '',
          post: embedded.post ?? existing?.post,
        } as Task);
        return;
      }

      if (!existing) {
        map.set(item.taskId, {
          id: item.taskId,
          title: '',
          ownerId: '',
          executorId: '',
          postId: '',
        } as Task);
      }
    });

    return map;
  }, [feedItems, tasksData]);

  const taskOptions = useMemo(() => {
    const feedTaskIds = new Set(feedItems.map(item => item.taskId));

    const tasksInFeed = Array.from(taskMap.values()).filter(task =>
      feedTaskIds.has(task.id)
    );

    // Пока фильтр по задаче активен, в ленте может быть только одна задача —
    // подмешиваем полный список задач, чтобы селект не опустел.
    if (
      taskId !== 'all' &&
      tasksInFeed.length <= 1 &&
      tasksData?.items?.length
    ) {
      return getDashboardTaskOptions(tasksData.items);
    }

    if (tasksInFeed.length > 0) {
      return getDashboardTaskOptions(tasksInFeed);
    }

    return getDashboardTaskOptions(tasksData?.items ?? []);
  }, [feedItems, taskMap, taskId, tasksData]);

  const items = useMemo(
    () => feedItems.map(item => mapActivityFeedItem(item, taskMap)),
    [feedItems, taskMap]
  );

  const total = data?.pages[0]?.total ?? 0;
  const hasActiveFilters = Boolean(activityType) || taskId !== 'all';
  const visibleItems = items.slice(0, visibleCount);
  const hasMoreToShow = visibleCount < total;

  const selectedTaskTitle = useMemo(
    () => taskOptions.find(task => task.id === taskId)?.title,
    [taskId, taskOptions]
  );

  const countLabel = String(total);

  const emptyMessage = useMemo(() => {
    if (activityType) {
      return `Нет событий типа «${TASK_ACTIVITY_LABELS[activityType]}»`;
    }

    if (taskId !== 'all') {
      return 'Нет активности по выбранной задаче';
    }

    return 'Пока нет активности';
  }, [activityType, taskId]);

  useEffect(() => {
    setTimeout(() => {
      setIsOpenFilter(false);
      setVisibleCount(DASHBOARD_ACTIVITY_PAGE_SIZE);
    }, 0);
  }, [activityType, taskId]);

  const handleResetFilters = () => {
    setActivityType(undefined);
    setTaskId('all');
  };

  const handleLoadMore = async () => {
    const nextCount = visibleCount + DASHBOARD_ACTIVITY_PAGE_SIZE;

    if (nextCount > items.length && hasNextPage) {
      await fetchNextPage();
    }

    setVisibleCount(nextCount);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '600px',
        display: 'flex',
        bgcolor: 'white',
        overflow: 'hidden',
        border: '1px solid',
        borderRadius: '32px',
        p: { xs: 2, md: 2.5 },
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
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'secondary.light',
              color: 'primary.main',
            }}
          >
            <HistoryOutlined fontSize="small" />
          </Box>

          <Stack
            spacing={0}
            sx={{ minWidth: 0 }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
            >
              <Typography
                variant="h6"
                sx={{ lineHeight: 1.2 }}
              >
                Активность
              </Typography>

              {!isLoading && total > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={countLabel}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                />
              )}
            </Stack>
          </Stack>
        </Stack>

        <IconButton
          onClick={() => setIsOpenFilter(prev => !prev)}
          sx={{
            color: hasActiveFilters ? 'primary.main' : 'text.secondary',
          }}
        >
          <FilterList />
        </IconButton>
      </Stack>

      {isOpenFilter && (
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
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { sm: 'center' } }}
          >
            <TextField
              select
              fullWidth
              size="small"
              label="Тип события"
              value={activityType ?? 'all'}
              onChange={event => {
                const value = event.target.value;
                setActivityType(
                  value === 'all' ? undefined : (value as TaskActivityType)
                );
              }}
              sx={{ minWidth: 0 }}
            >
              <MenuItem value="all">Все типы</MenuItem>
              {Object.entries(TASK_ACTIVITY_LABELS).map(([key, label]) => (
                <MenuItem
                  key={key}
                  value={key}
                >
                  {label}
                </MenuItem>
              ))}
            </TextField>

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
      )}

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
          sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}
        >
          <EmptyBlock
            title={emptyMessage}
            icon={<HistoryOutlined sx={{ fontSize: 40, color: 'text.disabled' }} />}
          />
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

      {visibleItems.length > 0 && (
        <Box
          sx={{
            minHeight: 0,
            flex: 1,
            overflowY: 'auto',
            pr: 0.25,
          }}
        >
          <Stack
            spacing={0}
            divider={<Divider flexItem sx={{ borderColor: 'divider' }} />}
          >
            {visibleItems.map(item => (
              <DashboardActivityListItem
                key={item.activity.id}
                item={item}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </Stack>

          {hasMoreToShow && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
              <Button
                size="small"
                variant="text"
                disabled={isFetchingNextPage}
                onClick={() => void handleLoadMore()}
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
