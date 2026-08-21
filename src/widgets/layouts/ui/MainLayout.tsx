import { Box } from '@mui/material';
import { SideBar } from '@widgets/side-bar';
import { lazy, Suspense, useRef } from 'react';

import { BACKGROUND_COLOR } from '@/app/index';
import { RouteSuspense, useScrollToTop } from '@/shared';
import { MobileNavDrawer } from '@/widgets/side-bar/ui/MobileNavDrawer';

import { ManagerShellRedirect } from './ManagerShellRedirect';

import type { ReactNode } from 'react';

const AuthModal = lazy(() =>
  import('@/features/auth/ui/AuthModal').then(module => ({
    default: module.AuthModal,
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
        gap: { xs: 0, md: .5 },
        bgcolor: BACKGROUND_COLOR
      }}
    >
      <ManagerShellRedirect />

      <Box data-print-hide >
        <SideBar />
      </Box>

      <Box data-print-hide>
        <MobileNavDrawer />
      </Box>

      <Box
        className="main-layout-content"
        sx={{
          flex: 1,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          height: '100dvh',
          maxHeight: '100dvh',
          overflow: 'hidden',
          '@media print': {
            height: 'auto',
            maxHeight: 'none',
            overflow: 'visible',
          },
        }}
      >
        <Box
          ref={scrollRef}
          data-main-scroll
          sx={{
            flex: 1,
            bgcolor: BACKGROUND_COLOR,
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            '@media print': {
              overflow: 'visible',
              height: 'auto',
            },
          }}
        >
          <RouteSuspense>{children}</RouteSuspense>
        </Box>
      </Box>

      <Suspense fallback={null}>
        <AuthModal />
        <AddToCollectionDialog />
      </Suspense>
    </Box>
  );
};

export default MainLayout;
