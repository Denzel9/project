import {
  AttachFile,
  Close,
  ExpandMore,
  ForumOutlined,
  Search,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Fade,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router';

import {
  isTaskOwner,
  usePinTaskCommentMutation,
  useSearchTaskCommentsQuery,
  useTaskCommentPinsQuery,
  useUpdateTaskCommentMutation,
  type TaskComment,
  type TaskCommentMedia,
} from '@/entities';
import {
  formatChatDaySeparatorLabel,
  isSameChatDay,
} from '@/entities/chat';
import { useAuthStore } from '@/features';
import { useUnreadCommentsDivider } from '@/pages/task/model/hooks/useUnreadCommentsDivider';
import {
  hasCommentText,
  toGalleryItems,
} from '@/pages/task/model/lib/commentMedia';
import { TaskCommentAttachmentsPanel } from '@/pages/task/ui/comment/TaskCommentAttachmentsPanel';
import { TaskCommentComposer } from '@/pages/task/ui/comment/TaskCommentComposer';
import { TaskCommentDaySeparator } from '@/pages/task/ui/comment/TaskCommentDaySeparator';
import { TaskCommentItem } from '@/pages/task/ui/comment/TaskCommentItem';
import { TaskCommentPinnedHeader } from '@/pages/task/ui/comment/TaskCommentPinnedHeader';
import { TaskCommentSearchPanel } from '@/pages/task/ui/comment/TaskCommentSearchPanel';
import { UnreadCommentsDivider } from '@/pages/task/ui/comment/UnreadCommentsDivider';
import { DeleteCommentDialog } from '@/pages/task/ui/DeleteCommentDialog';
import { FullScreenGallery } from '@/widgets';

import { DASHBOARD_COMMENT_CARD_COLLAPSE_MS } from '../model/constants';
import { useDashboardTaskCommentsThread } from '../model/useDashboardTaskCommentsThread';
import {
  getCommentPreview,
  getDashboardTaskPath,
  getTaskDisplayTitle,
  type DashboardTaskCommentsItem,
} from '../model/utils';

const SCROLL_LOAD_THRESHOLD_PX = 48;

const flexCollapseSx = {
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

type DashboardCommentGroupCardProps = {
  item: DashboardTaskCommentsItem;
  highlight?: string;
  expanded: boolean;
  fillHeight?: boolean;
  /** Без шапки карточки — тред на весь виджет, как диалог в чатах */
  embedded?: boolean;
  /** Скрыть кнопки поиска/вложений (управляются снаружи) */
  hideActions?: boolean;
  searchOpen?: boolean;
  searchQuery?: string;
  onSearchOpenChange?: (open: boolean) => void;
  onSearchQueryChange?: (query: string) => void;
  attachmentsOpen?: boolean;
  onAttachmentsOpenChange?: (open: boolean) => void;
  onToggle?: () => void;
  onCommentSuccess?: () => void;
};

export const DashboardCommentGroupCard = ({
  item,
  highlight,
  expanded,
  fillHeight = false,
  embedded = false,
  hideActions = false,
  searchOpen: searchOpenProp,
  searchQuery: searchQueryProp,
  onSearchOpenChange,
  onSearchQueryChange,
  attachmentsOpen: attachmentsOpenProp,
  onAttachmentsOpenChange,
  onToggle,
  onCommentSuccess,
}: DashboardCommentGroupCardProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const currentUserId = useAuthStore(state => state.id);
  const messagesRef = useRef<HTMLDivElement>(null);
  const skipScrollToBottomRef = useRef(false);
  const prevItemsLengthRef = useRef(0);
  const taskId = item.task.id;
  const isOwner = isTaskOwner(item.task, currentUserId);

  const [internalSearchOpen, setInternalSearchOpen] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchItems, setSearchItems] = useState<TaskComment[]>([]);
  const [internalAttachmentsOpen, setInternalAttachmentsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const isSearchOpen = searchOpenProp ?? internalSearchOpen;
  const searchQuery = searchQueryProp ?? internalSearchQuery;
  const isAttachmentsOpen = attachmentsOpenProp ?? internalAttachmentsOpen;

  const setIsSearchOpen = useCallback(
    (open: boolean) => {
      onSearchOpenChange?.(open);
      if (searchOpenProp === undefined) {
        setInternalSearchOpen(open);
      }
    },
    [onSearchOpenChange, searchOpenProp]
  );

  const setSearchQuery = useCallback(
    (query: string) => {
      onSearchQueryChange?.(query);
      if (searchQueryProp === undefined) {
        setInternalSearchQuery(query);
      }
    },
    [onSearchQueryChange, searchQueryProp]
  );

  const setIsAttachmentsOpen = useCallback(
    (open: boolean) => {
      onAttachmentsOpenChange?.(open);
      if (attachmentsOpenProp === undefined) {
        setInternalAttachmentsOpen(open);
      }
    },
    [onAttachmentsOpenChange, attachmentsOpenProp]
  );
  const [galleryItems, setGalleryItems] = useState<
    ReturnType<typeof toGalleryItems>
  >([]);
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [replyToComment, setReplyToComment] = useState<TaskComment | null>(
    null
  );

  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateTaskCommentMutation();
  const { mutateAsync: pinComment } = usePinTaskCommentMutation();

  const isThreadOpen = expanded || embedded;

  const { data: pinnedComments = [] } = useTaskCommentPinsQuery(
    isThreadOpen ? taskId : null
  );

  const {
    items: sortedComments,
    hasOlder,
    loadOlder,
    isLoadingOlder,
    isRefreshing,
    consumeScrollRestoreHeight,
  } = useDashboardTaskCommentsThread({
    taskId: isThreadOpen ? taskId : null,
    task: item.task,
    expanded: isThreadOpen,
  });

  const threadComments = sortedComments.map(threadItem => threadItem.comment);
  const unreadDividerCommentId = useUnreadCommentsDivider({
    taskId: isThreadOpen ? taskId : null,
    comments: threadComments,
    currentUserId,
    isLoading: isRefreshing,
    initialUnreadCount: item.unreadCount,
  });

  const pinnedCommentIds = useMemo(
    () => new Set(pinnedComments.map(pin => pin.commentId)),
    [pinnedComments]
  );

  const commentDayStarts = useMemo(() => {
    const starts = new Set<string>();

    threadComments.forEach((comment, index) => {
      if (
        index === 0 ||
        !isSameChatDay(threadComments[index - 1].createdAt, comment.createdAt)
      ) {
        starts.add(comment.id);
      }
    });

    return starts;
  }, [threadComments]);

  const jumpToComment = useCallback((commentId: string) => {
    const el = document.getElementById(`comment-${commentId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handlePin = async (commentId: string, nextPinned: boolean) => {
    try {
      await pinComment({
        taskId,
        commentId,
        isPinned: nextPinned,
      });
    } catch {
      // ignore
    }
  };

  const taskTitle = getTaskDisplayTitle(item.task);
  const taskPath = getDashboardTaskPath(item.task);
  const latestPreview = getCommentPreview(item.lastComment);
  const unreadCount = item.unreadCount;

  const openGallery = useCallback(
    (media: TaskCommentMedia[] | undefined, initialSlide: number) => {
      const gallery = toGalleryItems(media ?? []);

      if (!gallery.length) return;

      setGalleryItems(gallery);
      setGalleryInitialSlide(initialSlide);
      setGalleryOpen(true);
    },
    []
  );

  const openGalleryFromItems = useCallback(
    (gallery: ReturnType<typeof toGalleryItems>, initialSlide: number) => {
      if (!gallery.length) return;

      setGalleryItems(gallery);
      setGalleryInitialSlide(initialSlide);
      setGalleryOpen(true);
    },
    []
  );

  const handleLoadOlder = useCallback(() => {
    skipScrollToBottomRef.current = true;
    void loadOlder(messagesRef.current);
  }, [loadOlder]);

  const handleStartEdit = (commentId: string, text: string) => {
    setEditingId(commentId);
    setEditContent(hasCommentText(text) ? text : '');
  };

  const handleSaveEdit = (commentId: string) => {
    const comment = sortedComments.find(
      threadItem => threadItem.comment.id === commentId
    )?.comment;
    const trimmed = editContent.trim();
    const hasMedia = Boolean(comment?.media?.length);

    if (!trimmed && !hasMedia) return;

    updateComment(
      {
        taskId,
        commentId,
        body: { content: trimmed },
      },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent('');
        },
      }
    );
  };

  const handleDelete = (commentId: string) => {
    setDeletingId(commentId);
    setIsOpenDeleteDialog(true);
  };

  const handleMessagesScroll = useCallback(() => {
    const container = messagesRef.current;

    if (!container || isLoadingOlder || !hasOlder) return;

    if (container.scrollTop <= SCROLL_LOAD_THRESHOLD_PX) {
      handleLoadOlder();
    }
  }, [handleLoadOlder, hasOlder, isLoadingOlder]);

  const handleToggle = () => {
    onToggle?.();
  };

  useLayoutEffect(() => {
    const container = messagesRef.current;
    const previousHeight = consumeScrollRestoreHeight();

    if (!container || previousHeight === null) return;

    container.scrollTop = container.scrollHeight - previousHeight;
  }, [sortedComments.length, consumeScrollRestoreHeight]);

  useEffect(() => {
    if (!isThreadOpen) {
      prevItemsLengthRef.current = 0;
      return;
    }

    const container = messagesRef.current;

    if (!container) return;

    if (skipScrollToBottomRef.current) {
      skipScrollToBottomRef.current = false;
      prevItemsLengthRef.current = sortedComments.length;
      return;
    }

    const isNewMessageAtEnd =
      sortedComments.length > prevItemsLengthRef.current &&
      prevItemsLengthRef.current > 0;

    if (prevItemsLengthRef.current === 0 || isNewMessageAtEnd) {
      container.scrollTop = container.scrollHeight;
    }

    prevItemsLengthRef.current = sortedComments.length;
  }, [isThreadOpen, sortedComments.length]);

  useEffect(() => {
    if (isThreadOpen) return;

    const timer = window.setTimeout(() => {
      setIsSearchOpen(false);
      setSearchQuery('');
      setIsAttachmentsOpen(false);
    }, DASHBOARD_COMMENT_CARD_COLLAPSE_MS);

    return () => window.clearTimeout(timer);
  }, [isThreadOpen, setIsAttachmentsOpen, setIsSearchOpen, setSearchQuery]);

  const isDesktopSearch = isSearchOpen && !isMobile;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isDesktopSearch) {
      setTimeout(() => {
        setDebouncedQuery('');
        setSearchPage(1);
        setSearchItems([]);
      }, 0);
    }
  }, [isDesktopSearch]);

  useEffect(() => {
    setTimeout(() => {
      setSearchPage(1);
      setSearchItems([]);
    }, 0);
  }, [debouncedQuery, taskId]);

  const canSearch = isDesktopSearch && debouncedQuery.length >= 2;

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    error: searchError,
  } = useSearchTaskCommentsQuery(canSearch ? taskId : null, {
    q: debouncedQuery,
    page: searchPage,
    limit: 20,
  });

  useEffect(() => {
    if (!canSearch || !searchData) return;

    setTimeout(() => {
      setSearchItems(prev =>
        searchPage === 1 ? searchData.items : [...prev, ...searchData.items]
      );
    }, 0);
  }, [canSearch, searchData, searchPage]);

  const searchHasMore = Boolean(
    searchData && searchData.page * searchData.limit < searchData.total
  );

  const handleToggleSearch = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      setSearchQuery('');
      return;
    }

    setIsSearchOpen(true);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        ...(embedded
          ? {
            flex: 1,
            minHeight: 0,
            border: 'none',
            bgcolor: 'transparent',
          }
          : {
            borderRadius: '20px',
            border: '1px solid',
            borderColor: expanded ? 'primary.light' : 'divider',
            bgcolor: 'background.paper',
            boxShadow: expanded
              ? theme => `0 8px 24px ${theme.palette.primary.main}12`
              : '0 1px 2px rgba(15, 23, 42, 0.04)',
            transition: theme => theme.transitions.create(
              ['box-shadow', 'border-color', 'flex'],
              { duration: DASHBOARD_COMMENT_CARD_COLLAPSE_MS }
            ),
            ...(fillHeight && {
              flex: 1,
              minHeight: 0,
            }),
          }),
      }}
    >
      {!embedded && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            px: 1.5,
            py: 1.25,
            cursor: 'pointer',
            flexShrink: 0,
            alignItems: 'center',
            borderBottom: expanded ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
          onClick={handleToggle}
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
              color: 'primary.main',
              bgcolor: theme => `${theme.palette.primary.main}12`,
            }}
          >
            <ForumOutlined sx={{ fontSize: 20 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              onClick={event => event.stopPropagation()}
              component={Link}
              to={taskPath}
              variant="subtitle2"
              color="primary"
              sx={{
                fontWeight: 600,
                display: 'block',
                textDecoration: 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: 'fit-content',
                maxWidth: '100%',
                ':hover': { textDecoration: 'underline' },
              }}
            >
              {taskTitle}
            </Typography>

            {!expanded && latestPreview && (
              <Fade
                in
                timeout={DASHBOARD_COMMENT_CARD_COLLAPSE_MS}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.25,
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {latestPreview}
                </Typography>
              </Fade>
            )}
          </Box>

          {unreadCount > 0 && (
            <Chip
              size="small"
              color="error"
              label={unreadCount}
              sx={{ minWidth: 28 }}
            />
          )}

          {expanded && !hideActions && (
            <Fade
              in
              timeout={DASHBOARD_COMMENT_CARD_COLLAPSE_MS}
            >
              <Stack
                direction="row"
                spacing={0.25}
                sx={{ flexShrink: 0 }}
                onClick={event => event.stopPropagation()}
              >
                {isSearchOpen && !isMobile && (
                  <TextField
                    autoFocus
                    size="small"
                    label="Поиск"
                    value={searchQuery}
                    onClick={event => event.stopPropagation()}
                    onChange={event => setSearchQuery(event.target.value)}
                    sx={{ width: 200 }}
                  />
                )}

                <Tooltip title="Поиск по комментариям">
                  <IconButton
                    size="small"
                    aria-label="Поиск по комментариям"
                    onClick={handleToggleSearch}
                  >
                    {isSearchOpen ? (
                      <Close fontSize="small" />
                    ) : (
                      <Search fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Вложения">
                  <IconButton
                    size="small"
                    aria-label="Вложения"
                    onClick={() => setIsAttachmentsOpen(true)}
                  >
                    <AttachFile fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Fade>
          )}

          <IconButton
            size="small"
            aria-expanded={expanded}
            aria-label={
              expanded ? 'Свернуть комментарии' : 'Развернуть комментарии'
            }
            onClick={event => {
              event.stopPropagation();
              handleToggle();
            }}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: `transform ${DASHBOARD_COMMENT_CARD_COLLAPSE_MS}ms ease`,
            }}
          >
            <ExpandMore fontSize="small" />
          </IconButton>
        </Stack>
      )}

      {embedded && !hideActions && (
        <Stack
          direction="row"
          spacing={0.25}
          sx={{ flexShrink: 0, justifyContent: 'flex-end', mb: 1 }}
        >
          {isSearchOpen && !isMobile && (
            <TextField
              autoFocus
              size="small"
              label="Поиск"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              sx={{ width: 180, mr: 'auto' }}
            />
          )}

          <Tooltip title="Поиск по комментариям">
            <IconButton
              size="small"
              aria-label="Поиск по комментариям"
              onClick={handleToggleSearch}
            >
              {isSearchOpen ? (
                <Close fontSize="small" />
              ) : (
                <Search fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Вложения">
            <IconButton
              size="small"
              aria-label="Вложения"
              onClick={() => setIsAttachmentsOpen(true)}
            >
              <AttachFile fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      <Collapse
        in={isThreadOpen}
        unmountOnExit
        timeout={embedded ? 0 : DASHBOARD_COMMENT_CARD_COLLAPSE_MS}
        sx={fillHeight || embedded ? flexCollapseSx : undefined}
      >
        {!embedded && <Divider />}
        {!canSearch && (
          <TaskCommentPinnedHeader
            pinnedComments={pinnedComments}
            onJumpToComment={jumpToComment}
          />
        )}
        <Stack
          ref={messagesRef}
          spacing={1.25}
          onScroll={handleMessagesScroll}
          sx={{
            px: embedded ? 0 : 1.5,
            pt: embedded ? 0 : 1.5,
            pb: embedded ? 2 : 3,
            flex: fillHeight || embedded ? 1 : undefined,
            minHeight: fillHeight || embedded ? 0 : undefined,
            maxHeight: fillHeight || embedded ? undefined : 360,
            overflowY: 'auto',
            bgcolor: embedded ? 'transparent' : 'grey.50',
            opacity: isRefreshing ? 0.72 : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          {canSearch ? (
            <>
              {isSearchLoading && searchItems.length === 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {searchError && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ py: 2, textAlign: 'center' }}
                >
                  Не удалось выполнить поиск
                </Typography>
              )}

              {!isSearchLoading && !searchError && !searchItems.length && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2, textAlign: 'center' }}
                >
                  Ничего не найдено
                </Typography>
              )}

              {searchItems.map(comment => (
                <Box key={comment.id}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 0.5, display: 'block' }}
                  >
                    {format(new Date(comment.createdAt), 'dd.MM.yyyy HH:mm')}
                  </Typography>
                  <TaskCommentItem
                    comment={comment}
                    currentUserId={currentUserId}
                    highlight={debouncedQuery}
                    showActions={false}
                    onOpenGallery={openGallery}
                  />
                </Box>
              ))}

              {searchHasMore && (
                <Button
                  size="small"
                  variant="outlined"
                  disabled={isSearchFetching}
                  onClick={() => setSearchPage(prev => prev + 1)}
                >
                  {isSearchFetching ? 'Загрузка…' : 'Загрузить ещё'}
                </Button>
              )}
            </>
          ) : (
            <>
              {hasOlder && (
                <Box
                  sx={{ display: 'flex', justifyContent: 'center', pb: 0.5 }}
                >
                  <Button
                    size="small"
                    variant="text"
                    disabled={isLoadingOlder}
                    onClick={handleLoadOlder}
                  >
                    {isLoadingOlder ? (
                      <CircularProgress size={16} />
                    ) : (
                      'Загрузить ранние сообщения'
                    )}
                  </Button>
                </Box>
              )}

              {sortedComments.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 2, textAlign: 'center' }}
                >
                  Нет сообщений
                </Typography>
              )}

              {sortedComments.map(threadItem => (
                <Box
                  key={threadItem.comment.id}
                  sx={{ width: '100%' }}
                >
                  {commentDayStarts.has(threadItem.comment.id) && (
                    <TaskCommentDaySeparator
                      label={formatChatDaySeparatorLabel(
                        threadItem.comment.createdAt
                      )}
                    />
                  )}

                  {unreadDividerCommentId === threadItem.comment.id && (
                    <UnreadCommentsDivider />
                  )}

                  <TaskCommentItem
                    comment={threadItem.comment}
                    isOwner={isOwner}
                    currentUserId={currentUserId}
                    highlight={highlight}
                    isPending={isUpdating}
                    isPinned={pinnedCommentIds.has(threadItem.comment.id)}
                    isEditing={editingId === threadItem.comment.id}
                    editContent={editContent}
                    onEditContentChange={setEditContent}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onDelete={handleDelete}
                    onReply={setReplyToComment}
                    onPin={(id, next) => void handlePin(id, next)}
                    onReplyJump={jumpToComment}
                    onOpenGallery={openGallery}
                  />
                </Box>
              ))}
            </>
          )}
        </Stack>

        <Box
          sx={{
            px: embedded ? 0 : 1.5,
            py: embedded ? 1.5 : 1.25,
            pt: embedded ? 1.5 : 1.25,
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: embedded ? 'transparent' : 'background.paper',
          }}
          onClick={event => event.stopPropagation()}
        >
          {replyToComment && (
            <Stack
              direction="row"
              spacing={1}
              sx={{
                mb: 1,
                alignItems: 'center',
                px: 1.5,
                py: 1,
                borderRadius: '16px',
                bgcolor: 'secondary.light',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  width: 3,
                  alignSelf: 'stretch',
                  borderRadius: 1,
                  bgcolor: 'primary.main',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'block',
                  }}
                >
                  {replyToComment.actorDisplayName ||
                    (replyToComment.authorId === currentUserId
                      ? 'Вы'
                      : 'Ответ')}
                </Typography>
                <Typography
                  variant="body2"
                  noWrap
                  color="text.secondary"
                >
                  {replyToComment.content.trim() ||
                    (replyToComment.media?.length ? 'Медиа' : 'Комментарий')}
                </Typography>
              </Box>
              <IconButton
                size="small"
                aria-label="Отменить ответ"
                onClick={() => setReplyToComment(null)}
              >
                <Close fontSize="small" />
              </IconButton>
            </Stack>
          )}

          <TaskCommentComposer
            taskId={taskId}
            executorId={item.task.executorId}
            isExecutorApprove={item.task.isExecutorApprove}
            placeholder="Написать комментарий…"
            replyToId={replyToComment?.id}
            onSuccess={() => {
              setReplyToComment(null);
              onCommentSuccess?.();
            }}
          />
        </Box>
      </Collapse>

      {isThreadOpen && taskId && (
        <>
          <TaskCommentSearchPanel
            taskId={taskId}
            open={isSearchOpen && isMobile}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onOpenGallery={openGallery}
            currentUserId={currentUserId}
            onClose={() => {
              setIsSearchOpen(false);
              setSearchQuery('');
            }}
          />

          <TaskCommentAttachmentsPanel
            taskId={taskId}
            open={isAttachmentsOpen}
            onOpenGallery={openGalleryFromItems}
            onClose={() => setIsAttachmentsOpen(false)}
          />

          <DeleteCommentDialog
            taskId={taskId}
            commentId={deletingId}
            open={isOpenDeleteDialog}
            onClose={() => setIsOpenDeleteDialog(false)}
          />
        </>
      )}

      <FullScreenGallery
        isMobile={isMobile}
        items={galleryItems}
        isOpen={galleryOpen}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box>
  );
};
