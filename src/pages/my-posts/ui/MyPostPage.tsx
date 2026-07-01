import { InboxOutlined } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
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
import { IncomingApplicationItemSkeletonList } from './IncomingApplicationItemSkeleton';

const MyPostPage = () => {
  const navigate = useNavigate();

  const {
    status,
    updatedDate,
    q,
    postId,
    type: postType,
    setPosts,
    posts,
    resetFilters,
  } = useMyPostFilterStore();

  const {
    data: applications,
    isLoading,
    isError,
    refetch,
  } = useIncomingApplicationsQuery(
    toIncomingApplicationsParams({
      status,
      updatedDate,
      q,
      postId,
      type: postType,
    }),
  );

  useEffect(() => {
    if (!posts?.items?.length && applications) {
      setPosts(applications);
    }
  }, [applications, posts?.items?.length, setPosts]);

  const applicationItems = applications?.items ?? [];

  const isFilterEmpty =
    !updatedDate &&
    status === 'all' &&
    !q.trim() &&
    postType === 'all' &&
    postId === 'all';

  const hasActiveFilters = !isFilterEmpty;
  const isInitialLoading = isLoading && applicationItems.length === 0;
  const isEmpty = !isInitialLoading && !isError && applicationItems.length === 0;
  const showFilter = Boolean(applicationItems.length || hasActiveFilters);

  return (
    <PageLayout title="Отклики">
      {showFilter && (
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

      {isInitialLoading && <IncomingApplicationItemSkeletonList count={6} />}

      {isError && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'white',
            borderRadius: '32px',
            border: '1px solid',
            borderColor: 'divider',
            py: 6,
          }}
        >
          <EmptyBlock
            title="Не удалось загрузить отклики"
            buttonText="Повторить"
            buttonOnClick={() => void refetch()}
          />
        </Box>
      )}

      {isEmpty && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'white',
            borderRadius: '32px',
            border: '1px dashed',
            borderColor: 'divider',
            py: 8,
            px: 3,
          }}
        >
          <Stack
            spacing={2}
            sx={{ alignItems: 'center', maxWidth: 420 }}
          >
            <InboxOutlined sx={{ fontSize: 56, color: 'text.disabled' }} />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {hasActiveFilters
                ? 'По выбранным фильтрам ничего не найдено'
                : 'Пока нет входящих откликов'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {hasActiveFilters
                ? 'Попробуйте изменить фильтры или сбросить их'
                : 'Когда кандидаты откликнутся на ваши объявления, они появятся здесь'}
            </Typography>
            <Button
              variant="contained"
              onClick={() =>
                hasActiveFilters ? resetFilters() : navigate(ROUTES.INDEX)
              }
            >
              {hasActiveFilters ? 'Сбросить фильтры' : 'На главную'}
            </Button>
          </Stack>
        </Box>
      )}

      {!isInitialLoading && !isError && applicationItems.length > 0 && (
          <Box
            sx={{
              gap: 1.5,
              width: '100%',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(3, minmax(0, 1fr))',
              },
            }}
          >
            {applicationItems.map(application => (
              <IncomingApplicationItem
                key={application.id}
                application={application}
              />
            ))}
          </Box>
        )}
    </PageLayout>
  );
};

export default MyPostPage;
