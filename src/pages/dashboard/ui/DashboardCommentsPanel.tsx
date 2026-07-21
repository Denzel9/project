import {
  ChatBubbleOutlined,
  Close,
  FilterList,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useTasksWithCommentsInfiniteQuery, type Task } from '@/entities';
import { TaskCommentComposer } from '@/pages/task/ui/TaskCommentComposer';
import { useSnackbarStore } from '@/widgets';

import {
  DASHBOARD_COMMENTS_ITEMS_LIMIT,
  DASHBOARD_COMMENT_CARD_COLLAPSE_MS,
} from '../model/constants';
import {
  canCommentOnTask,
  getDashboardCommentsReadAfter,
  getDashboardTaskOptions,
  mapTaskWithCommentsItem,
  setDashboardCommentsReadAfter,
} from '../model/utils';

import { DashboardCommentGroupCard } from './DashboardCommentGroupCard';

const listFlexCollapseSx = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  '& .MuiCollapse-wrapper': {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  },
  '& .MuiCollapse-wrapperInner': {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
} as const;

export const DashboardCommentsPanel = () => {
  const [taskId, setTaskId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [readAfter, setReadAfter] = useState(getDashboardCommentsReadAfter);

  const { setSnackbarOpen } = useSnackbarStore();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useTasksWithCommentsInfiniteQuery({
      limit: DASHBOARD_COMMENTS_ITEMS_LIMIT,
      ...(appliedQuery && { q: appliedQuery }),
      ...(readAfter && { readAfter }),
    });

  const rawItems = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data?.pages],
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();

    rawItems.forEach(item => {
      const id = item.id || item.lastComment?.taskId;

      if (!id || map.has(id)) return;

      map.set(id, {
        id,
        title: item.title ?? '',
        ownerId: item.ownerId,
        executorId: item.executorId ?? '',
        postId: item.postId ?? '',
        status: item.status,
        isExecutorApprove: item.isExecutorApprove ?? undefined,
        post: item.post,
      } as Task);
    });

    return map;
  }, [rawItems]);

  const taskOptions = useMemo(
    () => getDashboardTaskOptions(Array.from(taskMap.values())),
    [taskMap],
  );

  const apiItems = useMemo(
    () => rawItems.map(item => mapTaskWithCommentsItem(item, taskMap)),
    [rawItems, taskMap],
  );

  const items = useMemo(
    () =>
      taskId !== 'all'
        ? apiItems.filter(item => item.task.id === taskId)
        : apiItems,
    [apiItems, taskId],
  );

  const hasActiveFilters = taskId !== 'all' || Boolean(appliedQuery);

  const selectedTaskTitle = useMemo(
    () => taskOptions.find(task => task.id === taskId)?.title,
    [taskId, taskOptions],
  );

  const selectedTask = useMemo(
    () => (taskId !== 'all' ? taskMap.get(taskId) : undefined),
    [taskId, taskMap],
  );

  const showSelectedTaskComposer =
    Boolean(selectedTask) && items.length === 0 && !isLoading;

  const emptyMessage = useMemo(() => {
    if (appliedQuery) {
      return `Нет комментариев по запросу «${appliedQuery}»`;
    }

    if (taskId !== 'all') {
      return 'Нет комментариев по выбранной задаче';
    }

    return 'Пока нет комментариев';
  }, [appliedQuery, taskId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAppliedQuery(searchQuery.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setTimeout(() => {
      setIsOpenFilter(false);
      setExpandedTaskId(null);
    }, 0);
  }, [taskId]);

  useEffect(() => {
    setTimeout(() => {
      setExpandedTaskId(null);
    }, 0);
  }, [appliedQuery]);

  const markTaskAsRead = () => {
    const now = new Date().toISOString();
    setDashboardCommentsReadAfter(now);
    setReadAfter(now);
  };

  const handleToggleGroup = (taskIdToToggle: string) => {
    if (!taskIdToToggle) return;

    setExpandedTaskId(prev => {
      if (prev === taskIdToToggle) {
        return null;
      }

      markTaskAsRead();

      return taskIdToToggle;
    });
  };

  const handleResetFilters = () => {
    setTaskId('all');
    setSearchQuery('');
    setAppliedQuery('');
  };

  const handleCommentSuccess = () => {
    setSnackbarOpen?.(true, 'Комментарий отправлен');
  };

  const isExpandedView = Boolean(expandedTaskId);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        bgcolor: 'white',
        overflow: isExpandedView ? 'hidden' : 'auto',
        p: { xs: 2, md: 2.5 },
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
        flexDirection: 'column',
        maxHeight: { xs: 560, lg: 'min(72vh, 720px)' },
        transition: theme =>
          theme.transitions.create(['height', 'max-height'], {
            duration: DASHBOARD_COMMENT_CARD_COLLAPSE_MS,
            easing: theme.transitions.easing.easeInOut,
          }),
        ...(isExpandedView && {
          height: { xs: 560, lg: 'min(72vh, 720px)' },
        }),
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
            <ChatBubbleOutlined fontSize="small" />
          </Box>

          <Stack
            spacing={0}
            sx={{ minWidth: 0 }}
          >
            <Typography
              variant="h6"
              sx={{ lineHeight: 1.2 }}
            >
              Комментарии
            </Typography>

            <Typography
              variant="caption"
              color="info"
              sx={{ lineHeight: 1.7, display: { xs: 'none', md: 'block' } }}
            >
              Последние комментарии по задачам
            </Typography>
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

            <TextField
              fullWidth
              size="small"
              label="Поиск по тексту"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              sx={{ minWidth: 0 }}
              slotProps={{
                input: {
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Очистить поиск"
                        onClick={() => {
                          setSearchQuery('');
                          setAppliedQuery('');
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />
          </Stack>

          {hasActiveFilters && (
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ mt: 1.25, flexWrap: 'wrap', gap: 0.75 }}
            >
              {taskId !== 'all' && selectedTaskTitle && (
                <Chip
                  size="small"
                  label={selectedTaskTitle}
                  onDelete={() => setTaskId('all')}
                />
              )}

              {appliedQuery && (
                <Chip
                  size="small"
                  label={`Поиск: ${appliedQuery}`}
                  onDelete={() => {
                    setSearchQuery('');
                    setAppliedQuery('');
                  }}
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

      {showSelectedTaskComposer && selectedTask && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '20px',
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ mb: 1.5, fontWeight: 600 }}
          >
            Комментарий к задаче «{selectedTaskTitle}»
          </Typography>

          {canCommentOnTask(selectedTask) ? (
            <TaskCommentComposer
              taskId={selectedTask.id}
              executorId={selectedTask.executorId}
              isExecutorApprove={selectedTask.isExecutorApprove}
              placeholder="Написать комментарий…"
              onSuccess={handleCommentSuccess}
            />
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Комментарии станут доступны после назначения исполнителя
            </Typography>
          )}
        </Box>
      )}

      {!isLoading && items.length === 0 && (
        <Stack
          spacing={1}
          sx={{ py: 5, alignItems: 'center', textAlign: 'center' }}
        >
          <ChatBubbleOutlined sx={{ fontSize: 44, color: 'text.disabled' }} />
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
            display: 'flex',
            flexDirection: 'column',
            ...(isExpandedView
              ? { flex: 1, minHeight: 0, overflow: 'hidden' }
              : { flexShrink: 0 }),
          }}
        >
          <Stack
            spacing={1}
            sx={{
              ...(isExpandedView && {
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }),
              ...(!isExpandedView && { pr: 0.5 }),
            }}
          >
            {items.map(item => {
              if (!item.task.id) return null;

              const isExpanded = expandedTaskId === item.task.id;
              const isVisible =
                expandedTaskId === null || expandedTaskId === item.task.id;

              return (
                <Collapse
                  key={item.task.id}
                  in={isVisible}
                  timeout={DASHBOARD_COMMENT_CARD_COLLAPSE_MS}
                  unmountOnExit={!isExpanded}
                  sx={isExpanded ? listFlexCollapseSx : undefined}
                >
                  <DashboardCommentGroupCard
                    item={item}
                    highlight={appliedQuery || undefined}
                    expanded={isExpanded}
                    fillHeight={isExpanded}
                    onToggle={() => handleToggleGroup(item.task.id)}
                    onCommentSuccess={handleCommentSuccess}
                  />
                </Collapse>
              );
            })}
          </Stack>

          <Collapse
            in={!expandedTaskId}
            timeout={DASHBOARD_COMMENT_CARD_COLLAPSE_MS}
            unmountOnExit
          >
            {hasNextPage && taskId === 'all' && (
              <Box
                sx={{
                  pt: 1.5,
                  flexShrink: 0,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Button
                  size="small"
                  variant="outlined"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                >
                  {isFetchingNextPage ? (
                    <CircularProgress size={18} />
                  ) : (
                    'Показать ещё'
                  )}
                </Button>
              </Box>
            )}
          </Collapse>
        </Box>
      )}
    </Box>
  );
};
