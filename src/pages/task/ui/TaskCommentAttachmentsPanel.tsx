import { Close, Description } from '@mui/icons-material';
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

import {
  useTaskCommentAttachmentsQuery,
  type TaskCommentAttachment,
} from '@/entities/task';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

import {
  getAttachmentGalleryIndex,
  isGalleryMedia,
  toGalleryItems,
} from '../lib/commentMedia';

type AttachmentFilter = 'all' | 'image' | 'video' | 'document';

type TaskCommentAttachmentsPanelProps = {
  open: boolean;
  onClose: () => void;
  taskId: string;
  onOpenGallery: (items: { url: string; mimeType: string }[], initialSlide: number) => void;
};

export const TaskCommentAttachmentsPanel = ({
  open,
  onClose,
  taskId,
  onOpenGallery,
}: TaskCommentAttachmentsPanelProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [filter, setFilter] = useState<AttachmentFilter>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TaskCommentAttachment[]>([]);

  const typeParam = filter === 'all' ? undefined : filter;

  useEffect(() => {
    setTimeout(() => {
      setPage(1);
      setItems([]);
    }, 0);
  }, [filter, taskId]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setFilter('all');
        setPage(1);
        setItems([]);
      }, 0);
    }
  }, [open]);

  const { data, isLoading, isFetching, error } = useTaskCommentAttachmentsQuery(
    open ? taskId : null,
    { type: typeParam, page, limit: 20 },
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

  const handleOpenAttachment = (item: TaskCommentAttachment, index: number) => {
    if (isGalleryMedia(item.mimeType)) {
      const galleryItems = toGalleryItems(items);
      onOpenGallery(galleryItems, getAttachmentGalleryIndex(items, index));
      return;
    }

    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  const getFileName = (key: string) => key.split('/').pop() ?? 'Документ';

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
          {items.map((item, index) => {
            const isMedia = isGalleryMedia(item.mimeType);

            return (
              <Box
                key={`${item.key}-${index}`}
                sx={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => handleOpenAttachment(item, index)}
              >
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
                      {getFileName(item.key)}
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
