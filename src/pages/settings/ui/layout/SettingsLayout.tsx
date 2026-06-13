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
        <SettingsSidebar />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 4,
            bgcolor: 'white',
            borderRadius: '32px',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default SettingsLayout;
