import { Box } from '@mui/material';

import { ApplicationForm } from '@/features/application-form';
import { PageLayout } from '@/widgets';

export const ManageApplicationPage = () => {
  return (
    <PageLayout>
      <Box
        sx={{
          width: '100%',
          bgcolor: 'white',
          p: 4,
          borderRadius: '32px',
          mt: 2,
        }}
      >
        <ApplicationForm />
      </Box>
    </PageLayout>
  );
};

export default ManageApplicationPage;
