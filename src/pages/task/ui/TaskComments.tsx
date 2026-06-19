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

import { validateChatMediaFile } from '@/entities/chat';
import {
  uploadTaskCommentMediaBatch,
  useCreateTaskCommentMutation,
  useUpdateTaskCommentMutation,
  type Task,
  type TaskCommentMedia,
} from '@/entities/task';
import { useGetUserByIdQuery, type User } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { ChatInput } from '@/shared/ui/messenger';
import { FullScreenGallery } from '@/widgets/media/ui/FullScreenGallery';

import {
  COMMENT_MEDIA_PLACEHOLDER,
  toGalleryItems,
} from '../model/lib/commentMedia';

import { DeleteCommentDialog } from './DeleteCommentDialog';
import { TaskCommentAttachmentsPanel } from './TaskCommentAttachmentsPanel';
import { TaskCommentItem } from './TaskCommentItem';
import { TaskCommentSearchPanel } from './TaskCommentSearchPanel';

type TaskCommentsProps = {
  task: Task;
  contact?: User;
};

export const TaskComments = ({ task, contact }: TaskCommentsProps) => {
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

  const comments = task.comments ?? [];
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
  }, [task.id, comments.length]);

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
        ? await uploadTaskCommentMediaBatch(task.id, pendingFiles)
        : undefined;

      await createComment({
        taskId: task.id,
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
      { taskId: task.id, commentId, body: { content: trimmed } },
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
          minHeight: '200px',
          maxHeight: '500px',
          overflowY: 'auto',
          mb: 3,
          width: '100%',
        }}
      >
        {comments.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Комментариев пока нет
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
        pendingFiles={pendingFiles}
        isSending={isPending}
        placeholder="Написать комментарий…"
        onChange={setContent}
        onAttachFiles={addPendingFiles}
        onRemoveFile={removePendingFile}
        onSend={() => void handleCreate()}
      />

      <DeleteCommentDialog
        taskId={task?.id}
        commentId={deletingId}
        open={isOpenDeleteDialog}
        onClose={() => setIsOpenDeleteDialog(false)}
      />

      <TaskCommentSearchPanel
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        taskId={task.id}
        currentUserId={currentUserId}
        userAvatar={user?.data?.avatar ?? undefined}
        contact={contact}
        onOpenGallery={openGallery}
      />

      <TaskCommentAttachmentsPanel
        open={isAttachmentsOpen}
        onClose={() => setIsAttachmentsOpen(false)}
        taskId={task.id}
        onOpenGallery={openGalleryFromItems}
      />

      <FullScreenGallery
        isOpen={galleryOpen}
        isMobile={isMobile}
        items={galleryItems}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box>
  );
};
