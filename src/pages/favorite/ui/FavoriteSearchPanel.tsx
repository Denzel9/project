import { Close } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import {
  useSearchFavoritesInfiniteQuery,
  type Favorite,
} from '@/entities/favorite';
import type { Post } from '@/entities/post';
import { InfiniteScrollSentinel } from '@/shared';
import { ROUTES } from '@/shared/config/routes';

import { partitionFavoriteSearchResults } from '../model/searchFavorites';

import type { FavoriteGroupFilter } from '../model/utils';

type FavoriteSearchPanelProps = {
  open: boolean;
  onClose: () => void;
  groupFilter: FavoriteGroupFilter;
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const renderHighlightedText = (text: string, highlight?: string): ReactNode => {
  const trimmedHighlight = highlight?.trim();

  if (!trimmedHighlight) {
    return text;
  }

  const parts = text.split(
    new RegExp(`(${escapeRegExp(trimmedHighlight)})`, 'gi'),
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
    ),
  );
};

const getPostSubtitle = (post: Post) => {
  const chips = post.chips?.slice(0, 2).join(' · ');
  const typeLabel = post.type === 'COMPANY' ? 'Компания' : 'Креатор';

  return chips ? `${typeLabel} · ${chips}` : typeLabel;
};

const FavoriteSearchResultItem = ({
  favorite,
  highlight,
  onOpen,
}: {
  favorite: Favorite;
  highlight: string;
  onOpen: (postId: string) => void;
}) => (
  <Box
    onClick={() => onOpen(favorite.postId)}
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
      {renderHighlightedText(favorite.post.title, highlight)}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ display: 'block', mt: 0.5 }}
    >
      {getPostSubtitle(favorite.post)}
    </Typography>
    <Typography
      variant="caption"
      color="text.secondary"
    >
      {format(new Date(favorite.post.createdAt), 'dd.MM.yyyy')}
    </Typography>
  </Box>
);

export const FavoriteSearchPanel = ({
  open,
  onClose,
  groupFilter,
}: FavoriteSearchPanelProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const navigate = useNavigate();

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

  const searchParams = useMemo(
    () => ({
      q: debouncedQuery,
      limit: 20,
      ...(groupFilter === 'ungrouped' && { ungrouped: true }),
      ...(groupFilter !== 'all' &&
        groupFilter !== 'ungrouped' && { groupId: groupFilter }),
    }),
    [debouncedQuery, groupFilter],
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useSearchFavoritesInfiniteQuery(searchParams);

  const items = data?.pages.flatMap(page => page.items) ?? [];

  const { inCurrentGroup, otherGroups } = useMemo(
    () => partitionFavoriteSearchResults(items, groupFilter),
    [items, groupFilter],
  );

  const canSearch = debouncedQuery.length >= 2;
  const hasResults = inCurrentGroup.length > 0 || otherGroups.length > 0;

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
        <Typography variant="h6">Поиск в избранном</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      <TextField
        autoFocus
        fullWidth
        size="small"
        value={query}
        placeholder="Поиск по избранным…"
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

        {canSearch && !isLoading && !error && !hasResults && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            Ничего не найдено
          </Typography>
        )}

        {canSearch &&
          !error &&
          inCurrentGroup.map(favorite => (
            <FavoriteSearchResultItem
              key={favorite.postId}
              favorite={favorite}
              highlight={debouncedQuery}
              onOpen={handleOpenPost}
            />
          ))}

        {canSearch &&
          !error &&
          otherGroups.map(({ groupLabel, items: groupItems }) => (
            <Box
              key={groupLabel}
              sx={{ mt: 1 }}
            >
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 600 }}
              >
                {groupLabel}
              </Typography>

              <Stack spacing={1}>
                {groupItems.map(favorite => (
                  <FavoriteSearchResultItem
                    key={favorite.postId}
                    favorite={favorite}
                    highlight={debouncedQuery}
                    onOpen={handleOpenPost}
                  />
                ))}
              </Stack>
            </Box>
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
