import { Box } from '@mui/material';
import { SideBar } from '@widgets/side-bar';
import { lazy, Suspense, useRef } from 'react';

import { useScrollToTop } from '@/shared';
import { MobileNavDrawer } from '@/widgets/side-bar/ui/MobileNavDrawer';

import type { ReactNode } from 'react';

const AuthModal = lazy(() =>
  import('@/features/auth/ui/AuthModal').then(module => ({
    default: module.AuthModal,
  }))
);

const GlobalDeletePostDialog = lazy(() =>
  import('@/features/delete-post/ui/GlobalDeletePostDialog').then(module => ({
    default: module.GlobalDeletePostDialog,
  }))
);

const AddToCollectionDialog = lazy(() =>
  import('@/widgets/post-item/ui/AddToCollectionDialog').then(module => ({
    default: module.AddToCollectionDialog,
  }))
);

export const MainLayout = ({ children }: { children: ReactNode }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollToTop(scrollRef);

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
        <Box
          ref={scrollRef}
          data-main-scroll
          sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}
        >
          {children}
        </Box>
      </Box>

      <Suspense fallback={null}>
        <AuthModal />
        <AddToCollectionDialog />
        <GlobalDeletePostDialog />
      </Suspense>
    </Box>
  );
};

export default MainLayout;
