import { Box, CircularProgress, Grid } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useMyApplicationsQuery,
  useWithdrawApplicationMutation,
} from '@/entities/application';
import { POST_TYPE_ENUM } from '@/entities/post';
import { EmptyBlock } from '@/shared';
import { ROUTES } from '@/shared/config/routes';
import { PageLayout } from '@/widgets';

import {
  toMyApplicationsParams,
  type ApplicationStatusFilter,
} from '../model/utils';

import MyResponsesFilter from './Filter';
import { MyResponseItem } from './MyResponseItem';

export const MyResponses = () => {
  const [postType, setPostType] = useState(POST_TYPE_ENUM.ALL);
  const [status, setStatus] = useState<ApplicationStatusFilter>('all');

  const { data: applications, isLoading } = useMyApplicationsQuery(
    toMyApplicationsParams({ status, postType })
  );

  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawApplicationMutation();

  const navigate = useNavigate();

  const isEmpty = !isLoading && !applications?.items?.length;

  return (
    <PageLayout title="Мои отклики">
      <MyResponsesFilter
        postType={postType}
        onPostTypeChange={setPostType}
        status={status}
        onStatusChange={setStatus}
      />

      <Box
        sx={{
          gap: 2,
          width: '100%',
          display: 'flex',
          bgcolor: 'white',
          p: { xs: 3, md: 4 },
          borderRadius: '32px',
          alignItems: isEmpty ? 'center' : 'start',
          justifyContent: isEmpty ? 'center' : 'start',
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}
        {isEmpty && (
          <EmptyBlock
            buttonText="На главную"
            title="У вас пока нет откликов"
            buttonOnClick={() => navigate(ROUTES.INDEX)}
          />
        )}

        {!isEmpty && (
          <Grid
            container
            spacing={2}
            sx={{ width: '100%' }}
          >
            {applications?.items?.map(application => (
              <Grid
                key={application.id}
                size={{ xs: 12, md: 4 }}
              >
                <MyResponseItem
                  key={application.id}
                  application={application}
                  isWithdrawing={isWithdrawing}
                  onWithdraw={withdrawApplication}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </PageLayout>
  );
};

export default MyResponses;
