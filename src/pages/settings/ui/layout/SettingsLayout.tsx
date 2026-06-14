import { Box } from '@mui/material';
import { Outlet } from 'react-router';

import { PageLayout } from '@/widgets';

import { SettingsSidebar } from './SettingsSidebar';

export const SettingsLayout = () => {
  return (
    <PageLayout isFullHeight>
      <Box
        sx={{
          mt: 2,
          gap: 2,
          width: '100%',
          display: 'flex',
        }}
      >
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <SettingsSidebar />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, md: 4 },
            bgcolor: 'white',
            borderRadius: { xs: '16px', md: '32px' },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default SettingsLayout;
