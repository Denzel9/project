import { Box, Typography } from '@mui/material';

import { PageLayout } from '@/widgets';

export const DashboardPage = () => {
  return (
    <PageLayout
      title="Dashboard"
      isScreenHeight
    >
      <Box sx={{ flex: 1, bgcolor: 'white', p: 4, borderRadius: 4 }}>
        <Typography>Dashboard</Typography>
      </Box>
    </PageLayout>
  );
};

export default DashboardPage;
