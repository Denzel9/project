import { Box, Drawer, Stack } from '@mui/material';
import { useMemo } from 'react';

import { useMyApplicationsMapForPosts } from '@/entities/application';
import { useFavoritePostIdsForPosts } from '@/entities/favorite';
import { usePostsInfiniteQuery } from '@/entities/post';
import {
  MainFilter,
  toPostInfiniteListParams,
  useMainFilterStore,
} from '@/features/main-filter';
import { SideBarFilter } from '@/features/main-filter/ui/SideBarFilter';
import { EmptyBlock, InfiniteScrollSentinel } from '@/shared';
import {
  ACTION_BUTTONS_KEYS,
  PostItem,
  PostItemSkeletonList,
  PageLayout,
} from '@/widgets';

export const HomePage = () => {
  const { isOpenMainFilter, setIsOpenMainFilter } = useMainFilterStore();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePostsInfiniteQuery(toPostInfiniteListParams());

  const posts = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data]
  );
  const postIds = useMemo(() => posts.map(post => post.id), [posts]);

  const { favoritePostIds, isLoading: isFavoritesLoading } =
    useFavoritePostIdsForPosts(postIds);

  const {
    map: myApplicationsMap,
    isLoading: isApplicationsLoading,
    removePostFromCollection,
  } = useMyApplicationsMapForPosts(postIds);

  const isInitialPostsLoading = isLoading && !posts.length;
  const isMetaLoading =
    postIds.length > 0 && (isFavoritesLoading || isApplicationsLoading);
  const isFeedReady = !isInitialPostsLoading && !isMetaLoading;

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
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRadius: { xs: '16px', md: '32px' },
        }}
      >
        {!isFeedReady && <PostItemSkeletonList count={5} />}

        {isFeedReady && !posts.length && (
          <EmptyBlock title="Пока нет объявлений" />
        )}

        {isFeedReady && posts.length > 0 && (
          <Stack
            direction="column"
            spacing={2}
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

      <Drawer
        anchor="right"
        open={isOpenMainFilter}
        onClose={() => setIsOpenMainFilter(!isOpenMainFilter)}
        sx={{
          '& .MuiDrawer-paper': {
            p: { xs: 2, md: 4 },
            borderTopLeftRadius: { xs: 0, md: 32 },
            borderBottomLeftRadius: { xs: 0, md: 32 },
            width: { xs: '100%', sm: '80%', md: '25%' },
          },
        }}
      >
        <SideBarFilter />
      </Drawer>
    </PageLayout>
  );
};

export default HomePage;
