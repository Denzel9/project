import { Box, CircularProgress, Grid } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useMyApplicationsQuery,
  useWithdrawApplicationMutation,
} from '@/entities/application';
import { useFavoritePostIds } from '@/entities/favorite';
import { POST_TYPE_ENUM } from '@/entities/post';
import { useAuthStore } from '@/features/auth';
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
  const { role: userRole } = useAuthStore();

  const [postType, setPostType] = useState(
    userRole === 'CREATOR' ? POST_TYPE_ENUM.COMPANY : POST_TYPE_ENUM.CREATOR
  );
  const [status, setStatus] = useState<ApplicationStatusFilter>('all');
  const [updatedDate, setUpdatedDate] = useState<string | null>(null);

  const { data: applications, isLoading } = useMyApplicationsQuery(
    toMyApplicationsParams({ status, postType, updatedDate })
  );

  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawApplicationMutation();

  const { favoritePostIds } = useFavoritePostIds();

  const navigate = useNavigate();

  const isEmpty = !isLoading && !applications?.items?.length;

  return (
    <PageLayout title="Мои отклики">
      <Box
        sx={{
          top: 0,
          zIndex: 1000,
          position: 'sticky',
        }}
      >
        <MyResponsesFilter
          status={status}
          postType={postType}
          updatedDate={updatedDate}
          onStatusChange={setStatus}
          onPostTypeChange={setPostType}
          onUpdatedDateChange={setUpdatedDate}
        />
      </Box>

      {isEmpty && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'white',
            borderRadius: '32px',
            height: '100%',
          }}
        >
          <EmptyBlock
            buttonText="На главную"
            title="У вас пока нет откликов"
            buttonOnClick={() => navigate(ROUTES.INDEX)}
          />
        </Box>
      )}

      {!isEmpty && !isLoading && (
        <Box
          sx={{
            gap: 2,
            width: '100%',
            display: 'flex',
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
                  isFavorite={favoritePostIds.has(application.post?.id ?? '')}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </PageLayout>
  );
};

export default MyResponses;
