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
  getFavoriteUserName,
  isFavoritePostItem,
  isFavoriteUserItem,
  useSearchFavoritesInfiniteQuery,
  type FavoritePostItem,
  type FavoriteType,
  type FavoriteUserItem,
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
  favoriteType: FavoriteType;
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
  favorite: FavoritePostItem;
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

const FavoriteUserSearchResultItem = ({
  favorite,
  highlight,
  onOpen,
}: {
  favorite: FavoriteUserItem;
  highlight?: string;
  onOpen: (userId: string) => void;
}) => (
  <Box
    onClick={() => onOpen(favorite.userId)}
    sx={{
      p: 1.5,
      borderRadius: '16px',
      cursor: 'pointer',
      border: '1px solid',
      borderColor: 'divider',
      ':hover': { bgcolor: 'action.hover' },
    }}
  >
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 600 }}
    >
      {renderHighlightedText(getFavoriteUserName(favorite.user), highlight)}
    </Typography>

    <Typography
      variant="caption"
      color="text.secondary"
    >
      {favorite.type === 'COMPANY' ? 'Компания' : 'Креатор'}
    </Typography>
  </Box>
);

export const FavoriteSearchPanel = ({
  open,
  onClose,
  groupFilter,
  favoriteType,
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
      type: favoriteType,
      ...(favoriteType === 'POST' && groupFilter === 'ungrouped' && { ungrouped: true }),
      ...(favoriteType === 'POST' &&
        groupFilter !== 'all' &&
        groupFilter !== 'ungrouped' && { groupId: groupFilter }),
    }),
    [debouncedQuery, groupFilter, favoriteType],
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
  const postItems = items.filter(isFavoritePostItem);
  const userItems = items.filter(isFavoriteUserItem);

  const { inCurrentGroup, otherGroups } = useMemo(
    () =>
      favoriteType === 'POST'
        ? partitionFavoriteSearchResults(postItems, groupFilter)
        : { inCurrentGroup: [], otherGroups: [] },
    [postItems, groupFilter, favoriteType],
  );

  const canSearch = debouncedQuery.length >= 2;
  const hasResults =
    favoriteType === 'POST'
      ? inCurrentGroup.length > 0 || otherGroups.length > 0
      : userItems.length > 0;

  const handleOpenPost = (postId: string) => {
    navigate(`${ROUTES.POST}/${postId}`);
    onClose();
  };

  const handleOpenProfile = (userId: string) => {
    navigate(`${ROUTES.PROFILE}?userId=${userId}`);
    onClose();
  };

  const searchPlaceholder =
    favoriteType === 'POST'
      ? 'Поиск по постам…'
      : favoriteType === 'CREATOR'
        ? 'Поиск по креаторам…'
        : 'Поиск по компаниям…';

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
        placeholder={searchPlaceholder}
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
          favoriteType === 'POST' &&
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
          favoriteType === 'POST' &&
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

        {canSearch &&
          !error &&
          favoriteType !== 'POST' &&
          userItems.map(favorite => (
            <FavoriteUserSearchResultItem
              key={favorite.userId}
              favorite={favorite}
              highlight={debouncedQuery}
              onOpen={handleOpenProfile}
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
