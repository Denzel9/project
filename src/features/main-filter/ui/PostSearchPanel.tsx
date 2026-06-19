import { Close } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useFavoritePostIds } from '@/entities/favorite';
import { useSearchPostsInfiniteQuery } from '@/entities/post';
import { InfiniteScrollSentinel } from '@/shared';
import { ROUTES } from '@/shared/config/routes';

import { PostSearchResultItem } from './PostSearchResultItem';

type PostSearchPanelProps = {
  open: boolean;
  onClose: () => void;
};

export const PostSearchPanel = ({ open, onClose }: PostSearchPanelProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const { favoritePostIds } = useFavoritePostIds();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setDebouncedQuery('');
    }
  }, [open]);

  const canSearch = debouncedQuery.length >= 2;

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useSearchPostsInfiniteQuery({
    q: debouncedQuery,
    limit: 20,
  });

  const items = data?.pages.flatMap(page => page.items) ?? [];

  const handleOpenPost = (postId: string) => {
    navigate(`${ROUTES.POST}/${postId}`);
    onClose();
  };

  const handleOpenChat = (ownerId: string) => {
    navigate(`${ROUTES.CHAT}?recipientId=${ownerId}`);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          p: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: 'column',
          width: isMobile ? '100%' : 400,
          borderTopLeftRadius: { xs: 0, md: 32 },
          borderBottomLeftRadius: { xs: 0, md: 32 },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 4 }}
      >
        <Typography variant="h6">Поиск</Typography>

        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      <TextField
        autoFocus
        fullWidth
        value={query}
        placeholder="Поиск по объявлениям…"
        onChange={event => setQuery(event.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setQuery('')}>
                  <Close />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
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
          <PostSearchResultItem
            key={post.id}
            post={post}
            highlightQuery={debouncedQuery}
            isFavorite={favoritePostIds.has(post.id)}
            onOpen={handleOpenPost}
            onOpenChat={handleOpenChat}
          />
        ))}

        {canSearch && (
          <InfiniteScrollSentinel
            hasMore={Boolean(hasNextPage)}
            isLoading={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        )}
      </Box>
    </Drawer>
  );
};
