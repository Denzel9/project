import { Box } from '@mui/material';
import { SideBar } from '@widgets/side-bar';

import { AuthModal } from '@/features/auth';
import { GlobalDeletePostDialog } from '@/features/delete-post';
import { AddToCollectionDialog } from '@/widgets/post-item';
import { MobileNavDrawer } from '@/widgets/side-bar/ui/MobileNavDrawer';

import type { ReactNode } from 'react';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 0, md: 2 },
        bgcolor: 'rgb(244, 244, 244)',
      }}
    >
      <SideBar />
      <MobileNavDrawer />

      <Box
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </Box>
      </Box>

      <AuthModal />
      <AddToCollectionDialog />
      <GlobalDeletePostDialog />
    </Box>
  );
};

export default MainLayout;
