import {
  AttachFile,
  ChatBubbleOutlined,
  ChevronLeft,
  Close,
  FilterList,
  ForumOutlined,
  Search,
} from '@mui/icons-material';
import {
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import { useTasksWithCommentsInfiniteQuery, type Task } from '@/entities';
import { TaskCommentComposer } from '@/pages/task/ui/comment/TaskCommentComposer';
import { EmptyBlock } from '@/shared';

import { DASHBOARD_COMMENTS_ITEMS_LIMIT } from '../model/constants';
import {
  canCommentOnTask,
  getCommentPreview,
  getDashboardTaskOptions,
  getTaskDisplayTitle,
  mapTaskWithCommentsItem,
} from '../model/utils';

import { DashboardCommentGroupCard } from './DashboardCommentGroupCard';

export const DashboardCommentsPanel = () => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const [taskId, setTaskId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isThreadSearchOpen, setIsThreadSearchOpen] = useState(false);
  const [threadSearchQuery, setThreadSearchQuery] = useState('');
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useTasksWithCommentsInfiniteQuery({
      limit: DASHBOARD_COMMENTS_ITEMS_LIMIT,
      ...(appliedQuery && { q: appliedQuery }),
      ...(taskId !== 'all' && { taskId }),
    });

  const { data: optionsData } = useTasksWithCommentsInfiniteQuery({
    limit: DASHBOARD_COMMENTS_ITEMS_LIMIT,
    ...(appliedQuery && { q: appliedQuery }),
  });

  const rawItems = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data]
  );

  const optionsRawItems = useMemo(
    () => optionsData?.pages.flatMap(page => page.items) ?? [],
    [optionsData]
  );

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();

    rawItems.forEach(item => {
      const id = item.id;

      if (!id || map.has(id)) return;

      map.set(id, {
        id,
        title: item.title ?? '',
        ownerId: item.ownerId ?? '',
        executorId: item.executorId ?? '',
        postId: item.postId ?? '',
        status: item.status,
        isExecutorApprove: item.isExecutorApprove ?? undefined,
        post: item.post,
      } as Task);
    });

    return map;
  }, [rawItems]);

  const taskOptions = useMemo(() => {
    const map = new Map<string, Task>();

    optionsRawItems.forEach(item => {
      const id = item.id;

      if (!id || map.has(id)) return;

      map.set(id, {
        id,
        title: item.title ?? '',
        ownerId: item.ownerId ?? '',
        executorId: item.executorId ?? '',
        postId: item.postId ?? '',
        status: item.status,
        isExecutorApprove: item.isExecutorApprove ?? undefined,
        post: item.post,
      } as Task);
    });

    taskMap.forEach((task, id) => {
      if (!map.has(id)) map.set(id, task);
    });

    return getDashboardTaskOptions(Array.from(map.values()));
  }, [optionsRawItems, taskMap]);

  const items = useMemo(
    () => rawItems.map(item => mapTaskWithCommentsItem(item, taskMap)),
    [rawItems, taskMap]
  );

  const hasActiveFilters = taskId !== 'all' || Boolean(appliedQuery);

  const selectedTaskTitle = useMemo(
    () => taskOptions.find(task => task.id === taskId)?.title,
    [taskId, taskOptions]
  );

  const selectedTask = useMemo(() => {
    if (taskId === 'all') return undefined;

    const fromMap = taskMap.get(taskId);

    if (fromMap) return fromMap;

    const optionItem = optionsRawItems.find(item => item.id === taskId);

    if (!optionItem) return undefined;

    const id = optionItem.id;

    if (!id) return undefined;

    return {
      id,
      title: optionItem.title ?? '',
      ownerId: optionItem.ownerId ?? '',
      executorId: optionItem.executorId ?? '',
      postId: optionItem.postId ?? '',
      status: optionItem.status,
      isExecutorApprove: optionItem.isExecutorApprove ?? undefined,
      post: optionItem.post,
    } as Task;
  }, [taskId, taskMap, optionsRawItems]);

  const selectedItem = useMemo(
    () => items.find(item => item.task.id === selectedTaskId) ?? null,
    [items, selectedTaskId]
  );

  const showSelectedTaskComposer =
    Boolean(selectedTask) &&
    items.length === 0 &&
    !isLoading &&
    !selectedTaskId;

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
      setSelectedTaskId(null);
    }, 0);
  }, [taskId, appliedQuery]);

  const handleResetFilters = () => {
    setTaskId('all');
    setSearchQuery('');
    setAppliedQuery('');
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
          spacing={1}
          sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}
        >
          {selectedItem ? (
            <IconButton
              aria-label="К списку комментариев"
              onClick={() => {
                setSelectedTaskId(null);
                setIsThreadSearchOpen(false);
                setThreadSearchQuery('');
                setIsAttachmentsOpen(false);
              }}
            >
              <ChevronLeft />
            </IconButton>
          ) : (
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
          )}

          <Typography
            variant={selectedItem ? "subtitle1" : "h6"}
          >
            {selectedItem
              ? getTaskDisplayTitle(selectedItem.task)
              : 'Комментарии'}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.25}
          sx={{ flexShrink: 0, alignItems: 'center' }}
        >
          {!selectedItem && (
            <IconButton
              onClick={() => setIsOpenFilter(prev => !prev)}
              sx={{
                color: hasActiveFilters ? 'primary.main' : 'text.secondary',
              }}
            >
              <FilterList />
            </IconButton>
          )}

          {selectedItem && (
            <>
              {isThreadSearchOpen && !isMobile && (
                <TextField
                  autoFocus
                  size="small"
                  label="Поиск"
                  value={threadSearchQuery}
                  onChange={event => setThreadSearchQuery(event.target.value)}
                  sx={{ width: 180 }}
                />
              )}

              <Tooltip title="Поиск по комментариям">
                <IconButton
                  aria-label="Поиск по комментариям"
                  onClick={() => {
                    if (isThreadSearchOpen) {
                      setIsThreadSearchOpen(false);
                      setThreadSearchQuery('');
                      return;
                    }

                    setIsThreadSearchOpen(true);
                  }}
                >
                  {isThreadSearchOpen ? <Close /> : <Search />}
                </IconButton>
              </Tooltip>

              <Tooltip title="Вложения">
                <IconButton
                  aria-label="Вложения"
                  onClick={() => setIsAttachmentsOpen(true)}
                >
                  <AttachFile />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </Stack>

      {!selectedItem && isOpenFilter && (
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
                label="Сбросить"
                variant="outlined"
                onClick={handleResetFilters}
                sx={{ flexShrink: 0 }}
              />
            </Stack>
          )}
        </Box>
      )}

      {!selectedItem && showSelectedTaskComposer && selectedTask && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: '20px',
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
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

      {!selectedItem && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                py: 6,
              }}
            >
              <CircularProgress size={28} />
            </Box>
          )}

          {!isLoading && items.length === 0 && (
            <Stack
              spacing={1}
              sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}
            >
              <EmptyBlock
                title={emptyMessage}
                icon={<ChatBubbleOutlined sx={{ fontSize: 44, color: 'text.disabled' }} />}
              />
              {hasActiveFilters && (
                <Chip
                  label="Сбросить"
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ flexShrink: 0 }}
                />
              )}
            </Stack>
          )}

          {!isLoading &&
            items.map(item => {
              if (!item.task.id) return null;

              const preview = getCommentPreview(item.lastComment);
              const timeLabel = item.lastComment
                ? format(new Date(item.lastComment.createdAt), 'HH:mm')
                : null;
              const hasUnread = item.unreadCount > 0;

              return (
                <Stack
                  key={item.task.id}
                  direction="row"
                  spacing={2}
                  onClick={() => setSelectedTaskId(item.task.id)}
                  sx={{
                    mb: 1,
                    p: 2,
                    width: '100%',
                    cursor: 'pointer',
                    borderRadius: '16px',
                    bgcolor: 'secondary.light',
                  }}
                >
                  <Badge
                    overlap="circular"
                    invisible={!hasUnread}
                    badgeContent={
                      item.unreadCount > 99 ? '99+' : item.unreadCount
                    }
                    color="error"
                    sx={{
                      '& .MuiBadge-badge': {
                        fontWeight: 600,
                        fontSize: '0.65rem',
                        minWidth: 18,
                        height: 18,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        borderRadius: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'common.white',
                        color: 'primary.main',
                      }}
                    >
                      <ForumOutlined fontSize="small" />
                    </Box>
                  </Badge>

                  <Stack
                    direction="column"
                    spacing={0.5}
                    sx={{ minWidth: 0, flex: 1 }}
                  >
                    <Typography
                      variant="body1"
                      noWrap
                      sx={{ fontWeight: hasUnread ? 700 : 500 }}
                    >
                      {getTaskDisplayTitle(item.task)}
                    </Typography>

                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: hasUnread ? 600 : 400 }}
                    >
                      {preview || 'Нет комментариев'}
                    </Typography>
                  </Stack>

                  {(timeLabel || item.recipient?.displayName) && (
                    <Stack
                      direction="column"
                      spacing={0.5}
                      sx={{
                        flexShrink: 0,
                        maxWidth: '40%',
                        textAlign: 'right',
                      }}
                    >
                      {timeLabel && (
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: hasUnread ? 600 : 400,
                            textAlign: 'right',
                          }}
                        >
                          {timeLabel}
                        </Typography>
                      )}

                      {item.recipient?.displayName && (
                        <Typography
                          variant="body2"
                          color="info.main"
                          noWrap
                          sx={{
                            fontWeight: hasUnread ? 600 : 400,
                            textAlign: 'right',
                          }}
                        >
                          {item.recipient.displayName}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Stack>
              );
            })}

          {hasNextPage &&
            taskId === 'all' &&
            !isLoading &&
            items.length > 0 && (
              <Box
                sx={{
                  pt: 1.5,
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
        </Box>
      )}

      {selectedItem && (
        <Stack
          spacing={0}
          sx={{ flex: 1, minHeight: 0 }}
        >
          <DashboardCommentGroupCard
            item={selectedItem}
            highlight={appliedQuery || undefined}
            expanded
            fillHeight
            embedded
            hideActions
            searchOpen={isThreadSearchOpen}
            searchQuery={threadSearchQuery}
            onSearchOpenChange={setIsThreadSearchOpen}
            onSearchQueryChange={setThreadSearchQuery}
            attachmentsOpen={isAttachmentsOpen}
            onAttachmentsOpenChange={setIsAttachmentsOpen}
          />
        </Stack>
      )}
    </Box>
  );
};
