import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import {
  useSearchTaskCommentsQuery,
  type TaskComment,
} from '@/entities/task';
import type { User } from '@/entities/user';

import { TaskCommentItem } from './TaskCommentItem';

type TaskCommentSearchPanelProps = {
  open: boolean;
  onClose: () => void;
  taskId: string;
  currentUserId: string | null;
  userAvatar?: string;
  contact?: User;
  onOpenGallery: (media: TaskComment['media'], initialSlide: number) => void;
};

export const TaskCommentSearchPanel = ({
  open,
  onClose,
  taskId,
  currentUserId,
  userAvatar,
  contact,
  onOpenGallery,
}: TaskCommentSearchPanelProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TaskComment[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setTimeout(() => {
      setPage(1);
      setItems([]);
    }, 0);
  }, [debouncedQuery, taskId]);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery('');
        setDebouncedQuery('');
        setPage(1);
        setItems([]);
      }, 0);
    }
  }, [open]);

  const { data, isLoading, isFetching, error } = useSearchTaskCommentsQuery(
    open ? taskId : null,
    { q: debouncedQuery, page, limit: 20 },
  );

  useEffect(() => {
    if (!data) return;

    setTimeout(() => {
      setItems(prev => (page === 1 ? data.items : [...prev, ...data.items]));
    }, 0);
  }, [data, page]);

  const hasMore = Boolean(data && data.page * data.limit < data.total);
  const canSearch = debouncedQuery.length >= 2;

  const handleLoadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: { xs: 0, md: 32 },
          borderBottomLeftRadius: { xs: 0, md: 32 },
          p: { xs: 2, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : 400,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Поиск комментариев</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      <TextField
        autoFocus
        fullWidth
        size="small"
        value={query}
        placeholder="Поиск по комментариям…"
        onChange={event => setQuery(event.target.value)}
      />

      <Box
        sx={{
          mt: 2,
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {!canSearch && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            Введите минимум 2 символа
          </Typography>
        )}

        {canSearch && isLoading && items.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {canSearch && error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ textAlign: 'center', py: 2 }}
          >
            Не удалось выполнить поиск
          </Typography>
        )}

        {canSearch && !isLoading && !error && items.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            Ничего не найдено
          </Typography>
        )}

        {items.map(comment => (
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
              userAvatar={userAvatar}
              contactAvatar={contact?.avatar ?? undefined}
              highlight={debouncedQuery}
              showActions={false}
              onOpenGallery={onOpenGallery}
            />
          </Box>
        ))}

        {hasMore && (
          <Button
            variant="outlined"
            disabled={isFetching}
            onClick={handleLoadMore}
          >
            {isFetching ? 'Загрузка…' : 'Загрузить ещё'}
          </Button>
        )}

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
      </Box>
    </Drawer>
  );
};
