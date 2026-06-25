import { Box, CircularProgress, Grid } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useIncomingApplicationsQuery } from '@/entities/application';
import { EmptyBlock } from '@/shared';
import { ROUTES } from '@/shared/config/routes';
import { PageLayout } from '@/widgets';

import { useMyPostFilterStore } from '../model/store';
import { toIncomingApplicationsParams } from '../model/utils';

import Filter from './Filter';
import { IncomingApplicationItem } from './IncomingApplicationItem';

const MyPostPage = () => {
  const navigate = useNavigate();

  const { status, updatedDate, q, postId, type, setPosts, posts } =
    useMyPostFilterStore();

  const { data: applications, isLoading } = useIncomingApplicationsQuery(
    toIncomingApplicationsParams({ status, updatedDate, q, postId, type })
  );

  useEffect(() => {
    if (!posts?.items.length && applications) {
      setPosts(applications);
    }
  }, [applications, posts?.items.length, setPosts]);

  const isEmpty = !isLoading && !applications?.items?.length;
  const isFilterEmpty =
    !updatedDate &&
    status === 'all' &&
    !q.trim() &&
    type === 'all' &&
    postId === 'all';

  return (
    <PageLayout title="Отклики">
      {Boolean(applications?.items?.length || !isFilterEmpty) && (
        <Box
          sx={{
            top: 0,
            zIndex: 1000,
            position: 'sticky',
          }}
        >
          <Filter />
        </Box>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
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
            py: 6,
          }}
        >
          <EmptyBlock
            buttonText="На главную"
            title="Пока нет входящих откликов"
            buttonOnClick={() => navigate(ROUTES.INDEX)}
          />
        </Box>
      )}

      {!isEmpty && !isLoading && (
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
              <IncomingApplicationItem application={application} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageLayout>
  );
};

export default MyPostPage;
