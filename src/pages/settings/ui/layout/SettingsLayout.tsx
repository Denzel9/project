import { Box } from '@mui/material';
import { Outlet } from 'react-router';

import { PageLayout } from '@/widgets';

import { SettingsSidebar } from './SettingsSidebar';

export const SettingsLayout = () => {
  return (
    <PageLayout>
      <Box
        sx={{
          gap: 2,
          width: '100%',
          display: 'flex',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'sticky',
            top: 0,
          }}
        >
          <SettingsSidebar />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: 'white',
            overflowY: 'auto',
            p: { xs: 3, md: 4 },
            borderRadius: { xs: '16px', md: '32px' },
            height: { xs: 'auto', md: 'calc(100vh - 136px)' },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default SettingsLayout;
