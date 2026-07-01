import {
  AttachFile,
  ChatBubbleOutlined,
  MoreVert,
  Search,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  canEditComment,
  uploadTaskCommentMediaBatch,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  validateChatMediaFile,
  useGetUserByIdQuery,
  type User,
  type TaskComment,
  type TaskCommentMedia,
} from '@/entities';
import { useAuthStore } from '@/features';
import { ChatInput } from '@/shared';
import { FullScreenGallery } from '@/widgets';

import {
  COMMENT_MEDIA_PLACEHOLDER,
  hasCommentText,
  toGalleryItems,
} from '../model/lib/commentMedia';

import { DeleteCommentDialog } from './DeleteCommentDialog';
import { TaskCommentAttachmentsPanel } from './TaskCommentAttachmentsPanel';
import { TaskCommentItem } from './TaskCommentItem';
import { TaskCommentSearchPanel } from './TaskCommentSearchPanel';

type TaskCommentsProps = {
  taskId: string;
  contact?: User;
  comments: TaskComment[];
  isExecutorApprove?: boolean;
};

export const TaskComments = ({
  taskId,
  comments,
  contact,
  isExecutorApprove,
}: TaskCommentsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentUserId = useAuthStore(state => state.id);

  const [content, setContent] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryItems, setGalleryItems] = useState<
    ReturnType<typeof toGalleryItems>
  >([]);
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0);

  const { data: user } = useGetUserByIdQuery(currentUserId || '');
  const { mutateAsync: createComment, isPending: isCreating } =
    useCreateTaskCommentMutation();
  const { mutate: updateComment, isPending: isUpdating } =
    useUpdateTaskCommentMutation();

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
          content: hasContent ? trimmed : COMMENT_MEDIA_PLACEHOLDER,
          media,
        },
      });

      setContent('');
      setPendingFiles([]);
    } catch {
      setSendError('Не удалось отправить комментарий');
    } finally {
      setIsSendingMedia(false);
    }
  };

  const handleStartEdit = (commentId: string, text: string) => {
    const comment = comments.find(item => item.id === commentId);

    if (!comment || !canEditComment(comment.createdAt)) return;

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
        body: { content: trimmed || COMMENT_MEDIA_PLACEHOLDER },
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

  const handleCloseMenu = () => setMenuAnchor(null);

  const handleOpenAttachments = () => {
    handleCloseMenu();
    setIsAttachmentsOpen(true);
  };

  const emptyMessage = isExecutorApprove
    ? 'Комментариев пока нет — напишите первым'
    : 'Комментарии станут доступны после назначения исполнителя';

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
          px: { xs: 2.5, md: 3 },
          py: 2,
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
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'flex',
              flexShrink: 0,
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <ChatBubbleOutlined fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center' }}
            >
              <Typography variant="h6">Комментарии</Typography>
              {comments.length > 0 && (
                <Chip
                  size="small"
                  label={comments.length}
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' } }}
            >
              Обсуждение задачи с исполнителем
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
        >
          <Tooltip title="Поиск">
            <IconButton
              size="small"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Вложения">
            <IconButton
              size="small"
              onClick={() => setIsAttachmentsOpen(true)}
            >
              <AttachFile fontSize="small" />
            </IconButton>
          </Tooltip>

          <IconButton
            size="small"
            onClick={event => setMenuAnchor(event.currentTarget)}
          >
            <MoreVert fontSize="small" />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleOpenAttachments}>Все вложения</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
        <Stack
          ref={commentsListRef}
          spacing={1.5}
          direction="column"
          sx={{
            mb: 2,
            width: '100%',
            minHeight: 220,
            maxHeight: 480,
            overflowY: 'auto',
            p: comments.length ? 1.5 : 0,
            borderRadius: '20px',
            bgcolor: comments.length ? 'grey.50' : 'transparent',
            border: comments.length ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          {!comments.length && (
            <Box
              sx={{
                py: 6,
                px: 2,
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

          {comments.map(comment => (
            <TaskCommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              userAvatar={user?.data?.avatar ?? undefined}
              contactAvatar={contact?.avatar ?? undefined}
              isPending={isPending}
              isEditing={editingId === comment.id}
              editContent={editContent}
              onEditContentChange={setEditContent}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={() => setEditingId(null)}
              onDelete={handleDelete}
              onOpenGallery={openGallery}
            />
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

        <Box
          sx={{
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <ChatInput
            value={content}
            onChange={setContent}
            isSending={isPending}
            executorId={contact?.id}
            pendingFiles={pendingFiles}
            onAttachFiles={addPendingFiles}
            onRemoveFile={removePendingFile}
            placeholder="Написать комментарий…"
            onSend={() => void handleCreate()}
            isExecutorApprove={isExecutorApprove}
          />
        </Box>
      </Box>

      <DeleteCommentDialog
        taskId={taskId}
        commentId={deletingId}
        open={isOpenDeleteDialog}
        onClose={() => setIsOpenDeleteDialog(false)}
      />

      <TaskCommentSearchPanel
        taskId={taskId}
        contact={contact}
        open={isSearchOpen}
        onOpenGallery={openGallery}
        currentUserId={currentUserId}
        onClose={() => setIsSearchOpen(false)}
        userAvatar={user?.data?.avatar ?? undefined}
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
