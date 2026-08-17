import { Box, CircularProgress, Grid } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import {
  useUpdateApplicationStatusMutation,
  type ApplicationList,
} from '@/entities/application';
import { APPLICATION_STATUS_ENUM } from '@/entities/application/model/utils';
import { EmptyBlock } from '@/shared';
import { ROUTES } from '@/shared/config/routes';
import { IncomingApplicationItem } from '@/widgets';

type IncomingApplicationsProps = {
  applications?: ApplicationList;
  isLoading: boolean;
  emptyTitle?: string;
};

export const IncomingApplications = ({
  applications,
  isLoading,
  emptyTitle = 'Пока нет откликов на этот пост',
}: IncomingApplicationsProps) => {
  const navigate = useNavigate();

  const { mutateAsync: updateStatus } = useUpdateApplicationStatusMutation();

  useEffect(() => {
    if (!applications?.items?.length) return;

    applications.items.forEach(application => {
      if (application.status === APPLICATION_STATUS_ENUM.NEW) {
        void updateStatus({
          id: application.id,
          body: { status: APPLICATION_STATUS_ENUM.VIEWED },
        });
      }
    });
  }, [applications?.items, updateStatus]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!applications?.items?.length) {
    return (
      <Box
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          bgcolor: 'background.paper',
          alignItems: 'center',
          borderRadius: '32px',
          justifyContent: 'center',
        }}
      >
        <EmptyBlock title={emptyTitle} />
      </Box>
    );
  }

  return (
    <Grid
      container
      spacing={2}
    >
      {applications.items.map(application => (
        <Grid
          key={application.id}
          size={{ xs: 12, sm: 6, md: 4 }}
          sx={{ display: 'flex' }}
        >
          <Box sx={{ width: '100%', height: '100%' }}>
            <IncomingApplicationItem
              application={application}
              showPostContext={false}
              onAccepted={() => navigate(ROUTES.MY_TASKS)}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
