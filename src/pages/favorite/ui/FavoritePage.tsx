import { Box } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useMyApplicationsMapForPosts,
  useFavoritesInfiniteQuery,
} from '@/entities';
import { EmptyBlock, InfiniteScrollSentinel, ROUTES } from '@/shared';
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

  const navigate = useNavigate();

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFavoritesInfiniteQuery(toFavoriteInfiniteListParams(groupFilter));

  const favorites = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data]
  );

  const postIds = useMemo(
    () => favorites.map(favorite => favorite.postId),
    [favorites]
  );

  const { map: myApplicationsMap } = useMyApplicationsMapForPosts(postIds);

  const isInitialLoading = isLoading && !favorites?.length;
  const isFilterEmpty = groupFilter === 'all';

  return (
    <PageLayout title="Избранное">
      {Boolean(favorites.length || !isFilterEmpty) && (
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
      )}

      <Box
        sx={{
          gap: 2,
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isInitialLoading && <PostItemSkeletonList count={5} />}

        {!favorites?.length && (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: '32px',
              height: '100%',
            }}
          >
            <EmptyBlock
              buttonText="На главную"
              title="В избранном пока ничего нет"
              buttonOnClick={() => navigate(ROUTES.INDEX)}
            />
          </Box>
        )}

        {favorites?.map(favorite => {
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

        {hasNextPage && (
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
