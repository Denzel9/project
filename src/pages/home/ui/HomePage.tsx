import { Box, Stack, useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useMyApplicationsMapForPosts } from '@/entities/application';
import { useFavoritePostIdsForPosts } from '@/entities/favorite';
import {
  usePostsInfiniteQuery,
  useSearchPostsInfiniteQuery,
} from '@/entities/post';
import {
  MainFilter,
  toPostInfiniteListParams,
  useMainFilterStore,
  hasActivePostFilters,
} from '@/features/main-filter';
import { EmptyBlock, InfiniteScrollSentinel } from '@/shared';
import {
  ACTION_BUTTONS_KEYS,
  PostItem,
  PostItemSkeletonList,
  PageLayout,
} from '@/widgets';

const searchMessageBoxSx = {
  flex: 1,
  display: 'flex',
  bgcolor: 'white',
  borderRadius: '32px',
  justifyContent: 'center',
  py: 6,
} as const;

export const HomePage = () => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const {
    filters,
    postFilters,
    resetAllFilters,
    isSearchOpen,
    searchQuery,
  } = useMainFilterStore();

  const isDesktopSearch = isSearchOpen && !isMobile;

  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isDesktopSearch) {
      setTimeout(() => {
        setDebouncedQuery('');
      }, 0);
    }
  }, [isDesktopSearch]);

  const canSearch = isDesktopSearch && debouncedQuery.length >= 2;

  const listParams = useMemo(
    () => toPostInfiniteListParams({ filters, postFilters }),
    [filters, postFilters]
  );

  const feedQuery = usePostsInfiniteQuery(listParams);

  const searchResultsQuery = useSearchPostsInfiniteQuery({
    q: debouncedQuery,
    limit: 20,
  });

  const activeQuery = canSearch ? searchResultsQuery : feedQuery;

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = activeQuery;

  const posts = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data]
  );
  const postIds = useMemo(() => posts.map(post => post.id), [posts]);

  const { favoritePostIds } = useFavoritePostIdsForPosts(postIds);

  const { map: myApplicationsMap, removePostFromCollection } =
    useMyApplicationsMapForPosts(postIds);

  const isInitialPostsLoading = isLoading && !posts.length;
  const hasActiveFilters =
    filters.length > 0 || hasActivePostFilters(postFilters);

  const renderPostList = () => (
    <Stack
      direction="column"
      spacing={1}
      sx={{
        width: '100%',
        alignItems: 'start',
      }}
    >
      {posts.map(post => {
        const application = myApplicationsMap.get(post.id);

        return (
          <PostItem
            post={post}
            key={post.id}
            applicationId={application?.id}
            isApplied={Boolean(application)}
            applicationStatus={application?.status}
            isFavorite={favoritePostIds.has(post.id)}
            removePostFromCollection={removePostFromCollection}
            isCompany={Boolean(post.owner.companyProfile?.companyName)}
            permissions={[
              favoritePostIds.has(post.id)
                ? ACTION_BUTTONS_KEYS.REMOVE_FROM_COLLECTION
                : ACTION_BUTTONS_KEYS.ADD_TO_COLLECTION,
            ]}
          />
        );
      })}

      <InfiniteScrollSentinel
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </Stack>
  );

  const renderSearchContent = () => {
    if (isInitialPostsLoading) {
      return <PostItemSkeletonList count={5} />;
    }

    if (isError) {
      return (
        <Box sx={searchMessageBoxSx}>
          <EmptyBlock
            title="Не удалось выполнить поиск"
            description="Попробуйте ещё раз"
            buttonText="Повторить"
            navigate={() => refetch()}
          />
        </Box>
      );
    }

    if (!posts.length) {
      return (
        <Box sx={searchMessageBoxSx}>
          <EmptyBlock
            title="Ничего не найдено"
            description="Попробуйте изменить запрос"
          />
        </Box>
      );
    }

    return renderPostList();
  };

  const renderFeedContent = () => {
    if (isInitialPostsLoading) {
      return <PostItemSkeletonList count={5} />;
    }

    if (isError) {
      return (
        <Box sx={searchMessageBoxSx}>
          <EmptyBlock
            title="Не удалось загрузить объявления"
            buttonText="Повторить"
            buttonOnClick={() => refetch()}
          />
        </Box>
      );
    }

    if (!posts.length) {
      return (
        <Box sx={searchMessageBoxSx}>
          <EmptyBlock
            title={
              hasActiveFilters
                ? 'По выбранным фильтрам ничего не найдено'
                : 'Пока нет объявлений'
            }
            description={
              hasActiveFilters
                ? 'Попробуйте изменить фильтры или сбросить их'
                : 'Когда кандидаты откликнутся на ваши объявления, они появятся здесь'
            }
            hasActiveFilters={hasActiveFilters}
            resetFilters={resetAllFilters}
          />
        </Box>
      );
    }

    return renderPostList();
  };

  return (
    <PageLayout>
      <Box
        sx={{
          top: 0,
          zIndex: 1000,
          position: 'sticky',
        }}
      >
        <MainFilter />
      </Box>

      <Box
        sx={{
          gap: 2,
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: { xs: '16px', md: '32px' },
        }}
      >
        {canSearch ? renderSearchContent() : renderFeedContent()}
      </Box>
    </PageLayout>
  );
};

export default HomePage;
