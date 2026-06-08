import { Box } from '@mui/material';
import { Outlet } from 'react-router';

import { PageLayout } from '@/widgets';

import { SettingsSidebar } from './SettingsSidebar';

export const SettingsLayout = () => {
  return (
    <PageLayout>
      <Box
        sx={{
          gap: 4,
          width: '100%',
          display: 'flex',
          bgcolor: 'white',
          borderRadius: '32px',
          p: 4,
          mt: 2,
        }}
      >
        <SettingsSidebar />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </PageLayout>
  );
};

export default SettingsLayout;
