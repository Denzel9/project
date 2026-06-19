import { Box, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { useMyApplicationsMapForPosts } from '@/entities/application';
import { useFavoritesInfiniteQuery } from '@/entities/favorite';
import { InfiniteScrollSentinel } from '@/shared';
import {
  ACTION_BUTTONS_KEYS,
  PostItem,
  PostItemSkeletonList,
  PageLayout,
} from '@/widgets';

import {
  toFavoriteInfiniteListParams,
  type FavoriteGroupFilter,
} from '../model/utils';

import FavoriteFilter from './Filter';

export const FavoritePage = () => {
  const [groupFilter, setGroupFilter] = useState<FavoriteGroupFilter>('all');

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFavoritesInfiniteQuery(toFavoriteInfiniteListParams(groupFilter));

  const favorites = data?.pages.flatMap(page => page.items) ?? [];
  const postIds = useMemo(
    () => favorites.map(favorite => favorite.postId),
    [favorites]
  );

  const { map: myApplicationsMap, isLoading: isApplicationsLoading } =
    useMyApplicationsMapForPosts(postIds);

  const isInitialLoading = isLoading && !favorites.length;
  const isMetaLoading = postIds.length > 0 && isApplicationsLoading;
  const isFeedReady = !isInitialLoading && !isMetaLoading;

  return (
    <PageLayout title="Избранное">
      <Box
        sx={{
          top: 0,
          zIndex: 1000,
          position: 'sticky',
        }}
      >
        <FavoriteFilter
          value={groupFilter}
          onChange={setGroupFilter}
        />
      </Box>

      <Box
        sx={{
          gap: 2,
          bgcolor: 'white',
          borderRadius: '32px',
          p: { xs: 0, md: 4 },
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
        }}
      >
        {!isFeedReady && <PostItemSkeletonList count={5} />}

        {isFeedReady && !favorites.length && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 6 }}
          >
            В избранном пока ничего нет
          </Typography>
        )}

        {isFeedReady &&
          favorites.map(favorite => {
            const application = myApplicationsMap.get(favorite.postId);

            return (
              <PostItem
                key={favorite.postId}
                post={favorite.post}
                isFavorite
                isApplied={Boolean(application)}
                applicationStatus={application?.status}
                applicationId={application?.id}
                permissions={[
                  ...(favorite.groupId === null
                    ? [ACTION_BUTTONS_KEYS.ADD_TO_FAVORITE_GROUP]
                    : []),
                  ACTION_BUTTONS_KEYS.REMOVE_FROM_COLLECTION,
                ]}
              />
            );
          })}

        {isFeedReady && (
          <InfiniteScrollSentinel
            hasMore={Boolean(hasNextPage)}
            isLoading={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        )}
      </Box>
    </PageLayout>
  );
};

export default FavoritePage;
