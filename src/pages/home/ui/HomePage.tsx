import { Box, Drawer } from '@mui/material';

import { MainFilter, useMainFilterStore } from '@/features/main-filter';
import { SideBarFilter } from '@/features/main-filter/ui/SideBarFilter';
import { ACTION_BUTTONS_KEYS, ApplicationItem, PageLayout } from '@/widgets';

export const HomePage = () => {
  const { isOpenMainFilter, setIsOpenMainFilter } = useMainFilterStore();

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
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'white',
          borderRadius: '32px',
          p: 4,
        }}
      >
        {[1, 2, 3, 4, 5].map(item => (
          <ApplicationItem
            key={item}
            item={item}
            permissions={[
              ACTION_BUTTONS_KEYS.HIDE,
              ACTION_BUTTONS_KEYS.ADD_TO_COLLECTION,
            ]}
          />
        ))}
      </Box>

      <Drawer
        anchor="right"
        open={isOpenMainFilter}
        onClose={() => setIsOpenMainFilter(!isOpenMainFilter)}
        sx={{
          '& .MuiDrawer-paper': {
            p: 4,
            width: '25%',
            borderTopLeftRadius: 32,
            borderBottomLeftRadius: 32,
          },
        }}
      >
        <SideBarFilter />
      </Drawer>
    </PageLayout>
  );
};

export default HomePage;
