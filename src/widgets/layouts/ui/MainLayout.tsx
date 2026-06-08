import { Box } from '@mui/material';
import { SideBar } from '@widgets/side-bar';

import { AuthModal } from '@/features/auth';

import type { ReactNode } from 'react';

export const MainLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, bgcolor: 'secondary.main' }}>
      <SideBar />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto' }}>{children}</Box>
      </Box>

      <AuthModal />
    </Box>
  );
};

export default MainLayout;
