import { KeyboardArrowUp } from '@mui/icons-material';
import { Box, Fade, IconButton, Stack } from '@mui/material';
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
import { EmptyBlock, InfiniteScrollSentinel, scrollMainToTop, useScroll } from '@/shared';
import {
  ACTION_BUTTONS_KEYS,
  PostItem,
  PostItemSkeletonList,
  PageLayout,
  PwaInstallBanner,
} from '@/widgets';

const searchMessageBoxSx = {
  flex: 1,
  display: 'flex',
  bgcolor: 'background.paper',
  alignItems: 'center',
  borderRadius: '32px',
  justifyContent: 'center',
} as const;

export const HomePage = () => {
  const { isScrolled, ref: scrollProbeRef } = useScroll(80);

  const {
    filters,
    postFilters,
    resetAllFilters,
    isSearchOpen,
    searchQuery,
  } = useMainFilterStore();

  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearchOpen) {
      setTimeout(() => {
        setDebouncedQuery('');
      }, 0);
    }
  }, [isSearchOpen]);

  const canSearch = isSearchOpen && debouncedQuery.length >= 2;

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
      <Box ref={scrollProbeRef} />

      <PwaInstallBanner />

      <Box sx={{ position: 'sticky', top: 0, zIndex: 1000 }}>
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

      <Fade in={isScrolled}>
        <IconButton
          aria-label="Наверх"
          onClick={() => scrollMainToTop('smooth')}
          sx={{
            position: 'fixed',
            right: { xs: 16, md: 28 },
            bottom: { xs: 24, md: 32 },
            zIndex: 1200,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
        >
          <KeyboardArrowUp />
        </IconButton>
      </Fade>
    </PageLayout>
  );
};

export default HomePage;
