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
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { useSearchPostsQuery, type Post } from '@/entities/post';
import { ROUTES } from '@/shared/config/routes';

type PostSearchPanelProps = {
  open: boolean;
  onClose: () => void;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedText = (text: string, highlight?: string): ReactNode => {
  const trimmedHighlight = highlight?.trim();

  if (!trimmedHighlight) {
    return text;
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'gi')
  );

  return parts.map((part, index) =>
    part.toLowerCase() === trimmedHighlight.toLowerCase() ? (
      <Box
        key={`${part}-${index}`}
        component="mark"
        sx={{
          bgcolor: 'warning.light',
          color: 'inherit',
          px: 0.25,
          borderRadius: 0.5,
        }}
      >
        {part}
      </Box>
    ) : (
      part
    )
  );
};

const getPostSubtitle = (post: Post) => {
  const chips = post.chips?.slice(0, 2).join(' · ');
  const typeLabel = post.type === 'COMPANY' ? 'Компания' : 'Креатор';

  return chips ? `${typeLabel} · ${chips}` : typeLabel;
};

export const PostSearchPanel = ({ open, onClose }: PostSearchPanelProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Post[]>([]);

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
  }, [debouncedQuery]);

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

  const { data, isLoading, isFetching, error } = useSearchPostsQuery({
    q: debouncedQuery,
    page,
    limit: 20,
  });

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

  const handleOpenPost = (postId: string) => {
    navigate(`${ROUTES.POST}/${postId}`);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : 400,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Поиск объявлений</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      <TextField
        autoFocus
        fullWidth
        size="small"
        value={query}
        placeholder="Поиск по объявлениям…"
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
          gap: 1.5,
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

        {items.map(post => (
          <Box
            key={post.id}
            onClick={() => handleOpenPost(post.id)}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              cursor: 'pointer',
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'secondary.main',
              },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600 }}
            >
              {renderHighlightedText(post.title, debouncedQuery)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.5 }}
            >
              {getPostSubtitle(post)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {format(new Date(post.createdAt), 'dd.MM.yyyy')}
            </Typography>
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
      </Box>
    </Drawer>
  );
};
