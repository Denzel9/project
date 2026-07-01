import { Box, Stack } from '@mui/material';
import { useMemo } from 'react';

import { useMyApplicationsMapForPosts } from '@/entities/application';
import { useFavoritePostIdsForPosts } from '@/entities/favorite';
import { usePostsInfiniteQuery } from '@/entities/post';
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

export const HomePage = () => {
  const { filters, postFilters } = useMainFilterStore();

  const listParams = useMemo(
    () => toPostInfiniteListParams({ filters, postFilters }),
    [filters, postFilters],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePostsInfiniteQuery(listParams);

  const posts = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data],
  );
  const postIds = useMemo(() => posts.map(post => post.id), [posts]);

  const { favoritePostIds } = useFavoritePostIdsForPosts(postIds);

  const { map: myApplicationsMap, removePostFromCollection } =
    useMyApplicationsMapForPosts(postIds);

  const isInitialPostsLoading = isLoading && !posts.length;
  const hasActiveFilters =
    filters.length > 0 || hasActivePostFilters(postFilters);

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
        {isInitialPostsLoading && <PostItemSkeletonList count={5} />}

        {isError && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              bgcolor: 'white',
              borderRadius: '32px',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <EmptyBlock
              title="Не удалось загрузить объявления"
              buttonText="Повторить"
              buttonOnClick={() => refetch()}
            />
          </Box>
        )}

        {!isInitialPostsLoading && !isError && !posts.length && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              bgcolor: 'white',
              borderRadius: '32px',
              justifyContent: 'center',
              py: 6,
            }}
          >
            <EmptyBlock
              title={
                hasActiveFilters
                  ? 'По выбранным фильтрам ничего не найдено'
                  : 'Пока нет объявлений'
              }
            />
          </Box>
        )}

        {!isInitialPostsLoading && !isError && posts.length > 0 && (
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
        )}
      </Box>
    </PageLayout>
  );
};

export default HomePage;
