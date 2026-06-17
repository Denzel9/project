import { Box, CircularProgress, Typography } from '@mui/material';
import { useState } from 'react';

import { useMyApplicationsMap } from '@/entities/application';
import { useFavoritesQuery } from '@/entities/favorite';
import { ACTION_BUTTONS_KEYS, PostItem, PageLayout } from '@/widgets';

import { toFavoriteListParams, type FavoriteGroupFilter } from '../model/utils';

import FavoriteFilter from './Filter';

export const FavoritePage = () => {
  const [groupFilter, setGroupFilter] = useState<FavoriteGroupFilter>('all');

  const { data: favorites, isLoading } = useFavoritesQuery(
    toFavoriteListParams(groupFilter)
  );

  const { map: myApplicationsMap } = useMyApplicationsMap();

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
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!isLoading && !favorites?.items?.length && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 6 }}
          >
            В избранном пока ничего нет
          </Typography>
        )}

        {favorites?.items?.map(favorite => {
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
      </Box>
    </PageLayout>
  );
};

export default FavoritePage;
