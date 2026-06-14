import { Close } from '@mui/icons-material';
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
import { MediaItem } from '@/widgets/media/ui/MediaItem';

type AttachmentFilter = 'all' | 'image' | 'video';

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

  const [filter, setFilter] = useState<AttachmentFilter>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ChatAttachment[]>([]);

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

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
          p: 4,
          width: isMobile ? '100%' : 420,
          display: 'flex',
          flexDirection: 'column',
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
          }}
        >
          {items.map(item => (
            <Box
              key={item.id}
              sx={{ cursor: 'pointer' }}
              onClick={() => handleOpenAttachment(item.url)}
            >
              <MediaItem
                width="100%"
                height={120}
                src={item.url}
                alt="Вложение"
                borderRadius="12px"
                mimeType={item.mimeType}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.5 }}
              >
                {format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm')}
              </Typography>
            </Box>
          ))}
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
    </Drawer>
  );
};
