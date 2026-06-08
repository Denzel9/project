import { Box } from '@mui/material';

import { ACTION_BUTTONS_KEYS, ApplicationItem, PageLayout } from '@/widgets';

import FavoriteFilter from './Filter';

export const FavoritePage = () => {
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
        {[1, 2, 3, 4, 5].map(item => (
          <ApplicationItem
            isFavorite
            key={item}
            item={item}
            permissions={[ACTION_BUTTONS_KEYS.REMOVE_FROM_COLLECTION]}
          />
        ))}
      </Box>
    </PageLayout>
  );
};

export default FavoritePage;
