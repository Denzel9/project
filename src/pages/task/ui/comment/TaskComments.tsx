import {
  AttachFile,
  ChatBubbleOutlined,
  Close,
  Search,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  canEditTaskComment,
  uploadTaskCommentMediaBatch,
  useAllTaskCommentsQuery,
  useCreateTaskCommentMutation,
  usePinTaskCommentMutation,
  useSearchTaskCommentsQuery,
  useTaskCommentPinsQuery,
  useUpdateTaskCommentMutation,
  validateChatMediaFile,
  type TaskComment,
  type User,
  type TaskCommentMedia,
} from '@/entities';
import {
  formatChatDaySeparatorLabel,
  isSameChatDay,
} from '@/entities/chat';
import { useAuthStore, useTaskCommentsRealtime } from '@/features';
import { ChatInput } from '@/shared';
import { FullScreenGallery } from '@/widgets';

import { useUnreadCommentsDivider } from '../../model/hooks/useUnreadCommentsDivider';
import { hasCommentText, toGalleryItems } from '../../model/lib/commentMedia';
import { DeleteCommentDialog } from '../DeleteCommentDialog';

import { TaskCommentAttachmentsPanel } from './TaskCommentAttachmentsPanel';
import { TaskCommentDaySeparator } from './TaskCommentDaySeparator';
import { TaskCommentItem } from './TaskCommentItem';
import { TaskCommentPinnedHeader } from './TaskCommentPinnedHeader';
import { TaskCommentSearchPanel } from './TaskCommentSearchPanel';
import { UnreadCommentsDivider } from './UnreadCommentsDivider';

type TaskCommentsProps = {
  taskId: string;
  contact?: User;
  isOwner?: boolean;
  disabled?: boolean;
  isExecutorApprove?: boolean | null;
};

export const TaskComments = ({
  taskId,
  contact,
  isOwner = false,
  disabled = false,
  isExecutorApprove,
}: TaskCommentsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentUserId = useAuthStore(state => state.id);

  useTaskCommentsRealtime({ taskId });

  const [content, setContent] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchItems, setSearchItems] = useState<TaskComment[]>([]);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<
    ReturnType<typeof toGalleryItems>
  >([]);
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0);
  const [replyToComment, setReplyToComment] = useState<TaskComment | null>(
    null
  );

  const { data: comments = [], isLoading: isCommentsLoading } =
    useAllTaskCommentsQuery(taskId);
  const { data: pinnedComments = [] } = useTaskCommentPinsQuery(taskId);
  const { mutateAsync: pinComment } = usePinTaskCommentMutation();
  const unreadDividerCommentId = useUnreadCommentsDivider({
    taskId,
    comments,
    currentUserId,
    isLoading: isCommentsLoading,
  });

  const pinnedCommentIds = useMemo(
    () => new Set(pinnedComments.map(pin => pin.commentId)),
    [pinnedComments]
  );

  const commentDayStarts = useMemo(() => {
    const starts = new Set<string>();

    comments.forEach((comment, index) => {
      if (
        index === 0 ||
        !isSameChatDay(comments[index - 1].createdAt, comment.createdAt)
      ) {
        starts.add(comment.id);
      }
    });

    return starts;
  }, [comments]);

  const jumpToComment = useCallback((commentId: string) => {
    const el = document.getElementById(`comment-${commentId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);
  const { mutateAsync: createComment, isPending: isCreating } =
    useCreateTaskCommentMutation();
  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateTaskCommentMutation();

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

  useEffect(() => {
    setTimeout(() => {
      setReplyToComment(null);
      setEditingId(null);
      setEditContent('');
    }, 0);
  }, [taskId]);

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

  const isPending = isCreating || isUpdating || isSendingMedia;

  const commentsListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (comments.length === 0) return;

    const hash = window.location.hash;
    const commentHashMatch = hash.match(/^#comment-(.+)$/);
    const targetCommentId = commentHashMatch?.[1];

    const timer = window.setTimeout(() => {
      if (targetCommentId) {
        const target = document.getElementById(`comment-${targetCommentId}`);

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      const listEl = commentsListRef.current;

      if (!listEl) return;

      listEl.scrollTo({
        top: listEl.scrollHeight,
        behavior: 'smooth',
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [comments]);

  const openGallery = useCallback(
    (media: TaskCommentMedia[] | undefined, initialSlide: number) => {
      const items = toGalleryItems(media ?? []);

      if (!items.length) return;

      setGalleryItems(items);
      setGalleryInitialSlide(initialSlide);
      setGalleryOpen(true);
    },
    []
  );

  const openGalleryFromItems = useCallback(
    (items: ReturnType<typeof toGalleryItems>, initialSlide: number) => {
      if (!items.length) return;

      setGalleryItems(items);
      setGalleryInitialSlide(initialSlide);
      setGalleryOpen(true);
    },
    []
  );

  const addPendingFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];

    for (const file of files) {
      const validationError = validateChatMediaFile(file);

      if (validationError) {
        setSendError(validationError);
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setPendingFiles(prev => [...prev, ...validFiles]);
    setSendError(null);
  }, []);

  const removePendingFile = useCallback((index: number) => {
    setPendingFiles(prev => prev.filter((_, fileIndex) => fileIndex !== index));
  }, []);

  const handleCreate = async () => {
    if (disabled) return;

    const trimmed = content.trim();
    const hasContent = Boolean(trimmed);
    const hasFiles = pendingFiles.length > 0;

    if (!hasContent && !hasFiles) return;

    try {
      setIsSendingMedia(true);
      setSendError(null);

      const media = hasFiles
        ? await uploadTaskCommentMediaBatch(taskId, pendingFiles)
        : undefined;

      await createComment({
        taskId,
        body: {
          ...(hasContent ? { content: trimmed } : { content: '' }),
          media,
          ...(replyToComment ? { replyToId: replyToComment.id } : {}),
        },
      });

      setContent('');
      setPendingFiles([]);
      setReplyToComment(null);
    } catch {
      setSendError('Не удалось отправить комментарий');
    } finally {
      setIsSendingMedia(false);
    }
  };

  const handleStartEdit = (commentId: string, text: string) => {
    if (disabled) return;

    const comment = comments.find(item => item.id === commentId);

    if (
      !comment ||
      !canEditTaskComment(comment, { userId: currentUserId, isOwner })
    ) {
      return;
    }

    setEditingId(commentId);
    setEditContent(hasCommentText(text) ? text : '');
  };

  const handleSaveEdit = (commentId: string) => {
    const comment = comments.find(item => item.id === commentId);
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
    if (disabled) return;

    setDeletingId(commentId);
    setIsOpenDeleteDialog(true);
  };

  const handlePin = async (commentId: string, nextPinned: boolean) => {
    if (disabled) return;

    try {
      await pinComment({
        taskId,
        commentId,
        isPinned: nextPinned,
      });
    } catch {
      // keep silent — list stays unchanged until invalidate
    }
  };

  const emptyMessage = disabled
    ? 'Комментарии недоступны для этой задачи'
    : isExecutorApprove
      ? 'Комментариев пока нет — напишите первым'
      : 'Комментарии станут доступны после назначения исполнителя';

  const canUseCommentTools = Boolean(isExecutorApprove);

  return (
    <Box
      sx={{
        bgcolor: 'white',
        overflow: 'hidden',
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          p: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Stack
            spacing={1}
            direction="row"
            sx={{ alignItems: 'center' }}
          >
            <Typography variant="h6">Комментарии</Typography>

            {comments.length > 0 && !isCommentsLoading && (
              <Chip
                size="small"
                label={comments.length}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </Stack>

        {canUseCommentTools && (
          <Stack
            spacing={1}
            direction="row"
            sx={{ alignItems: 'center' }}
          >
            {isSearchOpen && !isMobile && (
              <TextField
                autoFocus
                label="Поиск"
                size="small"
                variant="outlined"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                sx={{ width: 240 }}
              />
            )}

            <Tooltip title="Поиск">
              <IconButton onClick={handleToggleSearch}>
                {isSearchOpen ? <Close /> : <Search />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Вложения">
              <IconButton onClick={() => setIsAttachmentsOpen(true)}>
                <AttachFile />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>

      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        {!canSearch && (
          <TaskCommentPinnedHeader
            pinnedComments={pinnedComments}
            onJumpToComment={jumpToComment}
          />
        )}

        <Stack
          ref={commentsListRef}
          spacing={1.5}
          direction="column"
          sx={{
            mb: 2,
            flex: 1,
            width: '100%',
            minHeight: 320,
            maxHeight: 480,
            overflowY: 'auto',
            px: comments.length ? 1.5 : 0,
            pt: comments.length ? 1.5 : 0,
            pb: comments.length ? 3 : 0,
            borderRadius: '20px',
            bgcolor: comments.length ? 'grey.50' : 'transparent',
            border: comments.length ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {!isCommentsLoading && !comments.length && !canSearch && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 320,
                px: 2,
                py: 4,
                textAlign: 'center',
                borderRadius: '20px',
                bgcolor: 'grey.50',
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <ChatBubbleOutlined
                sx={{
                  mb: 1,
                  fontSize: 40,
                  color: 'text.disabled',
                }}
              />
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {emptyMessage}
              </Typography>
            </Box>
          )}

          {isCommentsLoading && !canSearch && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100%',
                py: 6,
              }}
            >
              <CircularProgress size={28} />
            </Box>
          )}

          {canSearch && (
            <>
              {isSearchLoading && searchItems.length === 0 && (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 6,
                  }}
                >
                  <CircularProgress size={28} />
                </Box>
              )}

              {searchError && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ textAlign: 'center', py: 2 }}
                >
                  Не удалось выполнить поиск
                </Typography>
              )}

              {!isSearchLoading && !searchError && !searchItems.length && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 4 }}
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
                  variant="outlined"
                  disabled={isSearchFetching}
                  onClick={() => setSearchPage(prev => prev + 1)}
                >
                  {isSearchFetching ? 'Загрузка…' : 'Загрузить ещё'}
                </Button>
              )}
            </>
          )}

          {!canSearch &&
            !isCommentsLoading &&
            comments.map(comment => (
              <Box
                key={comment.id}
                sx={{ width: '100%' }}
              >
                {commentDayStarts.has(comment.id) && (
                  <TaskCommentDaySeparator
                    label={formatChatDaySeparatorLabel(comment.createdAt)}
                  />
                )}

                {unreadDividerCommentId === comment.id && (
                  <UnreadCommentsDivider />
                )}

                <TaskCommentItem
                  comment={comment}
                  isOwner={isOwner}
                  currentUserId={currentUserId}
                  isPending={isPending}
                  isPinned={pinnedCommentIds.has(comment.id)}
                  isEditing={editingId === comment.id}
                  editContent={editContent}
                  onEditContentChange={setEditContent}
                  onStartEdit={handleStartEdit}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={handleDelete}
                  onReply={disabled ? undefined : setReplyToComment}
                  onPin={disabled ? undefined : (id, next) => void handlePin(id, next)}
                  onReplyJump={jumpToComment}
                  onOpenGallery={openGallery}
                  showActions={!disabled}
                />
              </Box>
            ))}
        </Stack>

        {sendError && (
          <Typography
            color="error"
            variant="body2"
            sx={{ mb: 1 }}
          >
            {sendError}
          </Typography>
        )}

        {canUseCommentTools && (
          <Stack spacing={1}>
            {replyToComment && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
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

            <ChatInput
              value={content}
              onChange={setContent}
              isSending={isPending}
              disabled={disabled}
              executorId={contact?.id}
              pendingFiles={pendingFiles}
              onAttachFiles={addPendingFiles}
              onRemoveFile={removePendingFile}
              placeholder={
                disabled
                  ? 'Комментарии недоступны'
                  : 'Написать комментарий…'
              }
              onSend={() => void handleCreate()}
              isExecutorApprove={isExecutorApprove}
            />
          </Stack>
        )}
      </Box>

      <DeleteCommentDialog
        taskId={taskId}
        commentId={deletingId}
        open={isOpenDeleteDialog}
        onClose={() => setIsOpenDeleteDialog(false)}
      />

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
