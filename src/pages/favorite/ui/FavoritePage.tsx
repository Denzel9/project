import { Box, CircularProgress, Typography } from '@mui/material';

import { useFavoritesQuery } from '@/entities/favorite';
import { ACTION_BUTTONS_KEYS, PostItem, PageLayout } from '@/widgets';

import FavoriteFilter from './Filter';

export const FavoritePage = () => {
  const { data: favorites, isLoading } = useFavoritesQuery({
    page: 1,
    limit: 20,
  });

  return (
    <PageLayout title="Избранное">
      <FavoriteFilter />

      <Box
        sx={{
          gap: 2,
          bgcolor: 'white',
          borderRadius: '32px',
          p: 4,
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

        {favorites?.items?.map(favorite => (
          <PostItem
            key={favorite.postId}
            post={favorite.post}
            isFavorite
            permissions={[ACTION_BUTTONS_KEYS.REMOVE_FROM_COLLECTION]}
          />
        ))}
      </Box>
    </PageLayout>
  );
};

export default FavoritePage;
