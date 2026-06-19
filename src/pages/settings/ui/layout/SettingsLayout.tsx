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
          flex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box
          sx={{
            top: 0,
            position: 'sticky',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <SettingsSidebar />
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            borderRadius: 4,
            bgcolor: 'white',
            overflowY: 'auto',
            p: { xs: 3, md: 4 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default SettingsLayout;
