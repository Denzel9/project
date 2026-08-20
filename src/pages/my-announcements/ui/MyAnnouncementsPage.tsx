import { Add, ArchiveOutlined, LockOutlined } from '@mui/icons-material';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

import {
  USER_ROLE,
  usePostByIdQuery,
  usePostsInfiniteQuery,
  usePostsQuery,
  useUpdatePostMutation,
} from '@/entities';
import { useAuthStore, useRequireEmailConfirmed } from '@/features/auth';
import {
  EmptyBlock,
  FilterAutocomplete,
  InfiniteScrollSentinel,
  ROUTES,
  stickyFilterSx,
  useScroll,
  type FilterAutocompleteOption,
} from '@/shared';
import {
  ACTION_BUTTONS_KEYS,
  PageLayout,
  PostItem,
  PostItemSkeletonList,
  PostSelectionBar,
  useSnackbarStore,
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
      ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
      ACTION_BUTTONS_KEYS.MAKE_PRIVATE,
    ];
  }

  if (tab === MEDIA_TAB.ARCHIVED) {
    return [
      ACTION_BUTTONS_KEYS.EDIT,
      ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
      ACTION_BUTTONS_KEYS.MAKE_PUBLIC,
    ];
  }

  return [
    ACTION_BUTTONS_KEYS.EDIT,
    ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
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
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const { isScrolled, ref: scrollProbeRef } = useScroll(80);
  const { setSnackbarOpen } = useSnackbarStore();
  const { mutateAsync: updatePost } = useUpdatePostMutation();

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
      isPrivate: isPrivate ? true : isActive ? false : undefined,
    }),
    [id, isArchived, isPrivate, isActive]
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

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      clearSelection();
    }, 0);
  }, [mediaTab, postId, clearSelection]);

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
  const selectedIdSet = new Set(selectedIds);
  const allVisibleSelected =
    posts.length > 0 && posts.every(post => selectedIdSet.has(post.id));

  const handleCreate = () => {
    if (!requireEmailConfirmed()) return;
    navigate(ROUTES.MANAGE_APPLICATION);
  };

  const handleEnterSelectionMode = () => {
    setIsSelectionMode(true);
  };

  const handleToggleSelect = (postIdToToggle: string) => {
    setSelectedIds(prev =>
      prev.includes(postIdToToggle)
        ? prev.filter(id => id !== postIdToToggle)
        : [...prev, postIdToToggle]
    );
  };

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(posts.map(post => post.id));
  };

  const applyBulkUpdate = async (
    body: { isArchived?: boolean; isPrivate?: boolean },
    successOne: string,
    successMany: (count: number) => string,
    failMessage: string
  ) => {
    if (!requireEmailConfirmed()) return;
    if (selectedIds.length === 0 || isBulkUpdating) return;

    setIsBulkUpdating(true);

    try {
      const results = await Promise.allSettled(
        selectedIds.map(id => updatePost({ id, body }))
      );

      const successCount = results.filter(
        result => result.status === 'fulfilled'
      ).length;
      const failCount = results.length - successCount;

      if (successCount > 0 && failCount === 0) {
        setSnackbarOpen(
          true,
          successCount === 1 ? successOne : successMany(successCount)
        );
        clearSelection();
        return;
      }

      if (successCount > 0) {
        const failedIds = selectedIds.filter(
          (_, index) => results[index]?.status === 'rejected'
        );
        setSelectedIds(failedIds);
        setSnackbarOpen(
          true,
          `Успешно: ${successCount}, не удалось: ${failCount}`,
          'error'
        );
        return;
      }

      setSnackbarOpen(true, failMessage, 'error');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkArchive = () => {
    void applyBulkUpdate(
      { isArchived: true },
      'Пост перемещен в архив',
      count => `В архив перемещено объявлений: ${count}`,
      'Не удалось переместить объявления в архив'
    );
  };

  const handleBulkMakePrivate = () => {
    void applyBulkUpdate(
      { isPrivate: true },
      'Пост сделан приватным',
      count => `Сделано приватными объявлений: ${count}`,
      'Не удалось сделать объявления приватными'
    );
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
        ref={scrollProbeRef}
        spacing={1}
        direction="row"
        sx={{
          ...stickyFilterSx,
          p: 2,
          mb: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderRadius: '24px',
          alignItems: 'center',
          borderColor: 'divider',
          justifyContent: 'space-between',
          borderTopLeftRadius: isScrolled ? 0 : 24,
          borderTopRightRadius: isScrolled ? 0 : 24,
          borderTopColor: isScrolled ? 'transparent' : 'divider',
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
            fullWidth
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
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            onClick={handleCreate}
          >
            Добавить
          </Button>

          <IconButton
            size="small"
            aria-label="Добавить объявление"
            sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
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
              pb: isSelectionMode ? 12 : 0,
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
                isSelectionMode={isSelectionMode}
                isSelected={selectedIdSet.has(post.id)}
                onToggleSelect={() => handleToggleSelect(post.id)}
                onEnterSelectionMode={handleEnterSelectionMode}
              />
            ))}
          </Stack>
        )}

        {isEmpty && (
          <Box
            sx={{
              py: 6,
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.paper',
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

      {isSelectionMode && (
        <PostSelectionBar
          selectedCount={selectedIds.length}
          totalCount={posts.length}
          isUpdating={isBulkUpdating}
          onClose={clearSelection}
          onSelectAll={handleSelectAll}
          actions={[
            ...(!isArchived
              ? [
                {
                  label: 'В архив',
                  icon: <ArchiveOutlined />,
                  variant: 'outlined' as const,
                  color: 'inherit' as const,
                  onClick: handleBulkArchive,
                },
              ]
              : []),
            ...(!isPrivate
              ? [
                {
                  label: 'Сделать приватным',
                  icon: <LockOutlined />,
                  variant: 'contained' as const,
                  color: 'primary' as const,
                  onClick: handleBulkMakePrivate,
                },
              ]
              : []),
          ]}
        />
      )}
    </PageLayout>
  );
};

export default MyAnnouncementsPage;
