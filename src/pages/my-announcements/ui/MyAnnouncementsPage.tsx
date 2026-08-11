import { Add } from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { keepPreviousData } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

import {
  USER_ROLE,
  usePostByIdQuery,
  usePostsInfiniteQuery,
  usePostsQuery,
} from '@/entities';
import { useAuthStore, useRequireEmailConfirmed } from '@/features/auth';
import {
  EmptyBlock,
  FilterAutocomplete,
  InfiniteScrollSentinel,
  ROUTES,
  stickyFilterSx,
  type FilterAutocompleteOption,
} from '@/shared';
import {
  ACTION_BUTTONS_KEYS,
  PageLayout,
  PostItem,
  PostItemSkeletonList,
} from '@/widgets';

enum MEDIA_TAB {
  ACTIVE = 'Active',
  ARCHIVED = 'Archived',
  PRIVATE = 'Private',
}

const SEARCH_MIN = 2;
const SEARCH_LIMIT = 20;

const getPermissions = (tab: MEDIA_TAB) => {
  if (tab === MEDIA_TAB.ACTIVE) {
    return [
      ACTION_BUTTONS_KEYS.EDIT,
      ACTION_BUTTONS_KEYS.DELETE,
      ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
      ACTION_BUTTONS_KEYS.MAKE_PRIVATE,
    ];
  }

  if (tab === MEDIA_TAB.ARCHIVED) {
    return [
      ACTION_BUTTONS_KEYS.EDIT,
      ACTION_BUTTONS_KEYS.DELETE,
      ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
      ACTION_BUTTONS_KEYS.MAKE_PUBLIC,
    ];
  }

  return [
    ACTION_BUTTONS_KEYS.EDIT,
    ACTION_BUTTONS_KEYS.DELETE,
    ACTION_BUTTONS_KEYS.MAKE_PUBLIC,
  ];
};

export const MyAnnouncementsPage = () => {
  const navigate = useNavigate();
  const { id, role } = useAuthStore();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();
  const [mediaTab, setMediaTab] = useState(MEDIA_TAB.ACTIVE);
  const [postId, setPostId] = useState('all');
  const [selectedPostOption, setSelectedPostOption] =
    useState<FilterAutocompleteOption | null>(null);
  const [postSearchQuery, setPostSearchQuery] = useState('');

  const isCompany = role === USER_ROLE.COMPANY;
  const isActive = mediaTab === MEDIA_TAB.ACTIVE;
  const isPrivate = mediaTab === MEDIA_TAB.PRIVATE;
  const isArchived = mediaTab === MEDIA_TAB.ARCHIVED;
  const isPostSelected = postId !== 'all';
  const canSearchPosts = postSearchQuery.trim().length >= SEARCH_MIN;

  const tabListParams = useMemo(
    () => ({
      ownerId: id || '',
      isArchived,
      isPrivate: isPrivate ? true : undefined,
    }),
    [id, isArchived, isPrivate]
  );

  const {
    data,
    isLoading,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePostsInfiniteQuery(
    {
      limit: 20,
      ...tabListParams,
    },
    { placeholderData: keepPreviousData }
  );

  const { data: selectedPost, isLoading: isSelectedPostLoading } =
    usePostByIdQuery(isPostSelected ? postId : null);

  const { data: postSearchData, isFetching: isPostSearchLoading } =
    usePostsQuery(
      {
        ...tabListParams,
        q: postSearchQuery.trim(),
        limit: SEARCH_LIMIT,
      },
      { enabled: Boolean(id) && canSearchPosts }
    );

  const postOptions = useMemo(
    () =>
      (postSearchData?.items ?? []).map(post => ({
        id: post.id,
        label: post.title?.trim() || 'Без названия',
      })),
    [postSearchData?.items]
  );

  if (!isCompany) {
    return (
      <Navigate
        to={ROUTES.INDEX}
        replace
      />
    );
  }

  const listPosts = data?.pages.flatMap(page => page.items) ?? [];
  const posts = isPostSelected
    ? selectedPost
      ? [selectedPost]
      : []
    : listPosts;
  const isInitialLoading = isPostSelected
    ? isSelectedPostLoading && !selectedPost
    : isLoading && !listPosts.length;
  const isEmpty = !isInitialLoading && !posts.length;
  const postPermissions = getPermissions(mediaTab);

  const handleCreate = () => {
    if (!requireEmailConfirmed()) return;
    navigate(ROUTES.MANAGE_APPLICATION);
  };

  const clearPostFilter = () => {
    setPostId('all');
    setSelectedPostOption(null);
    setPostSearchQuery('');
  };

  const handleMediaTabChange = (tab: MEDIA_TAB) => {
    setMediaTab(tab);
    clearPostFilter();
  };

  const handlePostChange = (nextId: string) => {
    setPostId(nextId);

    if (nextId === 'all') {
      setSelectedPostOption(null);
      return;
    }

    const option =
      postOptions.find(item => item.id === nextId) ?? selectedPostOption;

    setSelectedPostOption(
      option ?? { id: nextId, label: selectedPostOption?.label ?? nextId }
    );
  };

  return (
    <PageLayout>
      <Stack
        spacing={1.5}
        direction="row"
        sx={{
          ...stickyFilterSx,
          p: 2,
          mb: 1,
          bgcolor: 'white',
          border: '1px solid',
          borderRadius: '24px',
          alignItems: 'center',
          borderColor: 'divider',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ flex: 1, alignItems: 'center' }}>
          <FilterAutocomplete
            size="small"
            label="Поиск"
            value={postId}
            options={postOptions}
            placeholder="Название объявления"
            minInputLength={SEARCH_MIN}
            onSearch={setPostSearchQuery}
            onChange={handlePostChange}
            loading={isPostSearchLoading}
            selectedOption={selectedPostOption}
            sx={{ flex: 1, minWidth: { xs: '100%', sm: 220 }, maxWidth: 360 }}
          />

          {isPostSelected && (
            <Chip
              label="Сбросить"
              variant="outlined"
              onClick={clearPostFilter}
              sx={{ flexShrink: 0 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          <ButtonGroup sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button
              size="small"
              onClick={() => handleMediaTabChange(MEDIA_TAB.ACTIVE)}
              color={isActive ? 'primary' : 'info'}
            >
              Активные
            </Button>
            <Button
              size="small"
              onClick={() => handleMediaTabChange(MEDIA_TAB.ARCHIVED)}
              color={isArchived ? 'primary' : 'info'}
            >
              Архивные
            </Button>
            <Button
              size="small"
              onClick={() => handleMediaTabChange(MEDIA_TAB.PRIVATE)}
              color={isPrivate ? 'primary' : 'info'}
            >
              Приватные
            </Button>
          </ButtonGroup>

          <TextField
            select
            size="small"
            label="Статус"
            value={mediaTab}
            sx={{ display: { xs: 'block', sm: 'none' }, minWidth: 140 }}
            onChange={event =>
              handleMediaTabChange(event.target.value as MEDIA_TAB)
            }
          >
            <MenuItem value={MEDIA_TAB.ACTIVE}>Активные</MenuItem>
            <MenuItem value={MEDIA_TAB.ARCHIVED}>Архивные</MenuItem>
            <MenuItem value={MEDIA_TAB.PRIVATE}>Приватные</MenuItem>
          </TextField>




          <Button
            size="small"
            variant="contained"
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, ml: 'auto' }}
            onClick={handleCreate}
          >
            Добавить
          </Button>

          <IconButton
            size="small"
            aria-label="Добавить объявление"
            sx={{ display: { xs: 'inline-flex', sm: 'none' }, ml: 'auto' }}
            onClick={handleCreate}
          >
            <Add />
          </IconButton>
        </Stack>
      </Stack>

      <Stack
        direction="column"
        spacing={2}
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          overflow: 'hidden',
          flexDirection: 'column',
        }}
      >
        {isInitialLoading && (
          <PostItemSkeletonList
            count={5}
            isCompact
          />
        )}

        {!isInitialLoading && !isEmpty && (
          <Stack
            spacing={1}
            sx={{
              transition: 'opacity 120ms ease',
              opacity: isPlaceholderData && !isPostSelected ? 0.72 : 1,
            }}
          >
            {posts.map(post => (
              <PostItem
                isCompact
                post={post}
                key={post.id}
                isPrivate={isPrivate}
                permissions={postPermissions}
                isMyPost
                isCompany
              />
            ))}
          </Stack>
        )}

        {isEmpty && (
          <Box
            sx={{
              py: 6,
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
            }}
          >
            <EmptyBlock
              title="Объявления не найдены"
              hasActiveFilters={isPostSelected}
              resetFilters={clearPostFilter}
            />
          </Box>
        )}

        {!isPostSelected && (
          <InfiniteScrollSentinel
            onLoadMore={fetchNextPage}
            isLoading={isFetchingNextPage}
            hasMore={Boolean(hasNextPage) && !isPlaceholderData}
          />
        )}
      </Stack>
    </PageLayout>
  );
};

export default MyAnnouncementsPage;
