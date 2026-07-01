import { Box, Grid } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  isFavoritePostItem,
  isFavoriteUserItem,
  useMyApplicationsMapForPosts,
  useFavoritesInfiniteQuery,
  type FavoriteType,
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
import { FavoriteUserItemCard } from './FavoriteUserItemCard';

export const FavoritePage = () => {
  const [groupFilter, setGroupFilter] = useState<FavoriteGroupFilter>('all');
  const [favoriteType, setFavoriteType] = useState<FavoriteType>('POST');

  const navigate = useNavigate();

  const listParams = useMemo(
    () => toFavoriteInfiniteListParams(groupFilter, { type: favoriteType }),
    [groupFilter, favoriteType],
  );

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFavoritesInfiniteQuery(listParams);

  const favorites = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data],
  );

  const postFavorites = useMemo(
    () => favorites.filter(isFavoritePostItem),
    [favorites],
  );

  const userFavorites = useMemo(
    () => favorites.filter(isFavoriteUserItem),
    [favorites],
  );

  const postIds = useMemo(
    () => postFavorites.map(favorite => favorite.postId),
    [postFavorites],
  );

  const { map: myApplicationsMap } = useMyApplicationsMapForPosts(postIds);

  const isInitialLoading = isLoading && !favorites.length;
  const isFilterEmpty =
    favoriteType === 'POST' ? groupFilter === 'all' : true;
  const visibleItems =
    favoriteType === 'POST' ? postFavorites : userFavorites;
  const isEmpty = !isInitialLoading && !visibleItems.length;

  const emptyTitle =
    favoriteType === 'POST'
      ? 'В избранном пока нет постов'
      : favoriteType === 'CREATOR'
        ? 'В избранном пока нет креаторов'
        : 'В избранном пока нет компаний';

  return (
    <PageLayout title="Избранное">
      {Boolean(favorites.length || !isFilterEmpty || favoriteType !== 'POST') && (
        <Box
          sx={{
            top: 0,
            zIndex: 1000,
            position: 'sticky',
          }}
        >
          <FavoriteFilter
            value={groupFilter}
            favoriteType={favoriteType}
            onChange={setGroupFilter}
            onTypeChange={setFavoriteType}
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

        {isEmpty && (
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
              title={emptyTitle}
              buttonOnClick={() => navigate(ROUTES.INDEX)}
            />
          </Box>
        )}

        {favoriteType === 'POST' &&
          postFavorites.map(favorite => {
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

        {favoriteType !== 'POST' && (
          <Grid
            container
            spacing={1.5}
          >
            {userFavorites.map(favorite => (
              <Grid
                key={favorite.userId}
                size={{ xs: 12, md: 6 }}
              >
                <FavoriteUserItemCard favorite={favorite} />
              </Grid>
            ))}
          </Grid>
        )}

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
