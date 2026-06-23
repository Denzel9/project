import { MoreVert, Search } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
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

    const timer = window.setTimeout(() => {
      const listEl = commentsListRef.current;

      if (!listEl) return;

      listEl.scrollTo({
        top: listEl.scrollHeight,
        behavior: 'auto',
      });
    }, 100);

    return () => window.clearTimeout(timer);
  }, [comments.length]);

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
    setEditingId(commentId);
    setEditContent(text);
  };

  const handleSaveEdit = (commentId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    updateComment(
      { taskId, commentId, body: { content: trimmed } },
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

  return (
    <Box sx={{ bgcolor: 'white', p: { xs: 3, md: 4 }, borderRadius: '32px' }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Комментарии</Typography>

        <Stack
          direction="row"
          spacing={1}
        >
          <IconButton onClick={() => setIsSearchOpen(true)}>
            <Search />
          </IconButton>

          <IconButton onClick={event => setMenuAnchor(event.currentTarget)}>
            <MoreVert />
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleOpenAttachments}>Вложения</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <Stack
        ref={commentsListRef}
        spacing={2}
        direction="column"
        sx={{
          mb: 3,
          width: '100%',
          minHeight: '200px',
          maxHeight: '500px',
          overflowY: 'auto',
        }}
      >
        {Boolean(!comments.length) && isExecutorApprove && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Комментариев пока нет
          </Typography>
        )}

        {Boolean(!comments.length) && !isExecutorApprove && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Комментарии станут доступны после назначения исполнителя
          </Typography>
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
