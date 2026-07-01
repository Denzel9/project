import { Close, Delete, Description } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import { useAttachmentsQuery, type ChatAttachment } from '@/entities/chat';
import { useDeleteMediaMutation } from '@/entities/media';
import { useAuthStore } from '@/features/auth';
import {
  getFileNameFromKey,
  isGalleryMedia,
} from '@/widgets/media/lib/getMediaKind';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

type AttachmentFilter = 'all' | 'image' | 'video' | 'document';

type ChatAttachmentsPanelProps = {
  open: boolean;
  onClose: () => void;
  conversationId: string | null;
};

export const ChatAttachmentsPanel = ({
  open,
  onClose,
  conversationId,
}: ChatAttachmentsPanelProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentUserId = useAuthStore(state => state.id);

  const [filter, setFilter] = useState<AttachmentFilter>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChatAttachment[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { mutateAsync: deleteMedia } = useDeleteMediaMutation();

  const typeParam = filter === 'all' ? undefined : filter;

  useEffect(() => {
    setTimeout(() => {
      setPage(1);
      setItems([]);
    }, 0);
  }, [filter, conversationId]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setFilter('all');
        setPage(1);
        setItems([]);
      }, 0);
    }
  }, [open]);

  const { data, isLoading, isFetching, error } = useAttachmentsQuery(
    open ? conversationId : null,
    { type: typeParam, page, limit: 20 }
  );

  useEffect(() => {
    if (!data) return;

    setTimeout(() => {
      setItems(prev => (page === 1 ? data.items : [...prev, ...data.items]));
    }, 0);
  }, [data, page]);

  const hasMore = Boolean(data && data.page * data.limit < data.total);

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  const handleOpenAttachment = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteAttachment = async (
    event: React.MouseEvent,
    item: ChatAttachment
  ) => {
    event.stopPropagation();

    if (!conversationId || deletingId) return;

    setDeletingId(item.id);

    try {
      await deleteMedia({
        mediaId: item.id,
        conversationId,
      });
      setItems(prev => prev.filter(attachment => attachment.id !== item.id));
    } catch {
      // keep attachment on error
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          display: 'flex',
          p: { xs: 2, md: 4 },
          flexDirection: 'column',
          width: isMobile ? '100%' : 420,
          borderTopLeftRadius: { xs: 0, md: 32 },
          borderBottomLeftRadius: { xs: 0, md: 32 },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Вложения</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 2, flexWrap: 'wrap' }}
      >
        <Chip
          label="Все"
          color={filter === 'all' ? 'primary' : 'default'}
          onClick={() => setFilter('all')}
        />
        <Chip
          label="Фото"
          color={filter === 'image' ? 'primary' : 'default'}
          onClick={() => setFilter('image')}
        />
        <Chip
          label="Видео"
          color={filter === 'video' ? 'primary' : 'default'}
          onClick={() => setFilter('video')}
        />
        <Chip
          label="Документы"
          color={filter === 'document' ? 'primary' : 'default'}
          onClick={() => setFilter('document')}
        />
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {isLoading && items.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ textAlign: 'center', py: 2 }}
          >
            Не удалось загрузить вложения
          </Typography>
        )}

        {!isLoading && !error && items.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            Вложений пока нет
          </Typography>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' },
            gap: 1,
            rowGap: 4,
          }}
        >
          {items.map(item => {
            const canDelete =
              Boolean(currentUserId) && item.senderId === currentUserId;
            const isMedia = isGalleryMedia(item.mimeType, item.url);

            return (
              <Box
                key={item.id}
                sx={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => handleOpenAttachment(item.url)}
              >
                {canDelete && (
                  <IconButton
                    size="small"
                    color="error"
                    disabled={deletingId === item.id}
                    onClick={event => handleDeleteAttachment(event, item)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      zIndex: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    {deletingId === item.id ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Delete fontSize="small" />
                    )}
                  </IconButton>
                )}

                {isMedia ? (
                  <MediaItem
                    src={item.url}
                    alt="Вложение"
                    mimeType={item.mimeType}
                  />
                ) : (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      alignItems: 'center',
                      bgcolor: 'secondary.light',
                    }}
                  >
                    <Description color="action" />
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ flex: 1 }}
                    >
                      {getFileNameFromKey(item.key)}
                    </Typography>
                  </Stack>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm')}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {hasMore && (
          <Button
            fullWidth
            sx={{ mt: 2 }}
            variant="outlined"
            disabled={isFetching}
            onClick={handleLoadMore}
          >
            {isFetching ? 'Загрузка…' : 'Загрузить ещё'}
          </Button>
        )}
      </Box>

      <Button
        sx={{
          width: 'fit-content',
          position: 'fixed',
          bottom: { xs: 16, md: 32 },
          right: { xs: 16, md: 32 },
        }}
        variant="outlined"
        onClick={onClose}
      >
        Закрыть
      </Button>
    </Drawer>
  );
};
