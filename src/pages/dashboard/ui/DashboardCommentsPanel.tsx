import { ChatBubbleOutlined, Close } from '@mui/icons-material';
import {
  Box,
  Button,
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

import { DASHBOARD_COMMENTS_ITEMS_LIMIT, DASHBOARD_COMMENT_CARD_COLLAPSE_MS } from '../model/constants';
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

type DashboardCommentsPanelProps = {
  tasks?: Task[];
};

export const DashboardCommentsPanel = ({
  tasks = [],
}: DashboardCommentsPanelProps) => {
  const [taskId, setTaskId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [readAfter, setReadAfter] = useState(getDashboardCommentsReadAfter);

  const { setSnackbarOpen } = useSnackbarStore();

  const taskMap = useMemo(
    () => new Map(tasks.map(task => [task.id, task])),
    [tasks]
  );

  const taskOptions = useMemo(() => getDashboardTaskOptions(tasks), [tasks]);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useTasksWithCommentsInfiniteQuery({
      limit: DASHBOARD_COMMENTS_ITEMS_LIMIT,
      ...(appliedQuery && { q: appliedQuery }),
      ...(readAfter && { readAfter }),
    });

  const apiItems = useMemo(
    () =>
      (data?.pages.flatMap(page => page.items) ?? []).map(item =>
        mapTaskWithCommentsItem(item, taskMap)
      ),
    [data?.pages, taskMap]
  );

  const items = useMemo(
    () =>
      taskId !== 'all'
        ? apiItems.filter(item => item.task.id === taskId)
        : apiItems,
    [apiItems, taskId]
  );

  const hasActiveFilters = taskId !== 'all' || Boolean(appliedQuery);

  const selectedTaskTitle = useMemo(
    () => taskOptions.find(task => task.id === taskId)?.title,
    [taskId, taskOptions]
  );

  const selectedTask = useMemo(
    () => (taskId !== 'all' ? taskMap.get(taskId) : undefined),
    [taskId, taskMap]
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
      setExpandedTaskId(null);
    }, 0);
  }, [taskId]);

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
        p: { xs: 2, md: 3 },
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
        spacing={1.5}
        sx={{
          mb: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          Комментарии
        </Typography>

        <Stack
          spacing={1.5}
          direction={{ xs: 'column', lg: 'row' }}
          sx={{ alignItems: { lg: 'center' } }}
        >
          <TextField
            select
            size="small"
            label="Задача"
            value={taskId}
            onChange={event => setTaskId(event.target.value)}
            sx={{ minWidth: { xs: '100%', lg: 220 }, flex: { lg: 1 } }}
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
            size="small"
            label="Поиск по тексту"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            sx={{ minWidth: { xs: '100%', lg: 240 }, flex: { lg: 1.2 } }}
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
      </Stack>

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
