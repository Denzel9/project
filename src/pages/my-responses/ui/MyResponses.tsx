import { Box, CircularProgress, Grid } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useFavoritePostIds } from '@/entities';
import {
  useMyApplicationsQuery,
  useWithdrawApplicationMutation,
} from '@/entities/application';
import { EmptyBlock, ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import {
  toMyApplicationsParams,
  type ApplicationStatusFilter,
} from '../model/utils';

import MyResponsesFilter from './Filter';
import { MyResponseItem } from './MyResponseItem';

export const MyResponses = () => {
  const [status, setStatus] = useState<ApplicationStatusFilter>('all');
  const [updatedDate, setUpdatedDate] = useState<string | null>(null);

  const { data: applications, isLoading } = useMyApplicationsQuery(
    toMyApplicationsParams({ status, updatedDate })
  );

  const { mutate: withdrawApplication, isPending: isWithdrawing } =
    useWithdrawApplicationMutation();

  const { favoritePostIds } = useFavoritePostIds();

  const navigate = useNavigate();

  const isEmpty = !isLoading && !applications?.items?.length;
  const isFilterEmpty = !updatedDate && status === 'all';

  return (
    <PageLayout title="Мои отклики">
      {Boolean(applications?.items?.length || !isFilterEmpty) && (
        <Box
          sx={{
            top: 0,
            zIndex: 1000,
            position: 'sticky',
          }}
        >
          <MyResponsesFilter
            status={status}
            updatedDate={updatedDate}
            onStatusChange={setStatus}
            onUpdatedDateChange={setUpdatedDate}
          />
        </Box>
      )}

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
            spacing={1}
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
