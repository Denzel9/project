import { ReplyAllOutlined } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useMyApplicationsCompanyOptionsQuery,
  useMyApplicationsInfiniteQuery,
  useWithdrawApplicationMutation,
} from '@/entities/application';
import { useFavoritePostIdsForPosts } from '@/entities/favorite';
import { useExecutorTasksByPostMap } from '@/entities/task';
import { EmptyBlock, InfiniteScrollSentinel, ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import {
  filterApplicationsByCompany,
  hasActiveMyResponseFilters,
  toMyApplicationsParams,
  type ApplicationStatusFilter,
  type CompanyFilter,
} from '../model/utils';

import MyResponsesFilter from './Filter';
import { MyResponseItem } from './MyResponseItem';
import { MyResponseItemSkeletonList } from './MyResponseItemSkeleton';

export const MyResponses = () => {
  const [status, setStatus] = useState<ApplicationStatusFilter>('all');
  const [updatedDate, setUpdatedDate] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<CompanyFilter>('all');
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const navigate = useNavigate();

  const listParams = useMemo(
    () => toMyApplicationsParams({ status, updatedDate }),
    [status, updatedDate],
  );

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMyApplicationsInfiniteQuery(listParams);

  const { data: companyOptions = [] } = useMyApplicationsCompanyOptionsQuery();
  const { data: executorTasksByPostMap } = useExecutorTasksByPostMap();

  const applications = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data],
  );

  const visibleApplications = useMemo(
    () => filterApplicationsByCompany(applications, companyId),
    [applications, companyId],
  );

  const postIds = useMemo(
    () =>
      visibleApplications
        .map(application => application.post?.id)
        .filter((id): id is string => Boolean(id)),
    [visibleApplications],
  );

  const { favoritePostIds } = useFavoritePostIdsForPosts(postIds);

  const { mutate: withdrawApplication } = useWithdrawApplicationMutation();

  const hasActiveFilters = hasActiveMyResponseFilters({
    status,
    updatedDate,
    companyId,
  });

  const isFilterEmpty =
    !updatedDate && status === 'all' && companyId === 'all';

  const isInitialLoading = isLoading && !applications.length;
  const isEmpty = !isInitialLoading && !isError && !visibleApplications.length;
  const showFilter = Boolean(applications.length || !isFilterEmpty);

  useEffect(() => {
    if (
      companyId === 'all' ||
      visibleApplications.length > 0 ||
      !hasNextPage ||
      isFetchingNextPage
    ) {
      return;
    }

    void fetchNextPage();
  }, [
    companyId,
    visibleApplications.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  const handleResetFilters = () => {
    setStatus('all');
    setUpdatedDate(null);
    setCompanyId('all');
  };

  const handleWithdraw = (applicationId: string) => {
    setWithdrawingId(applicationId);
    withdrawApplication(applicationId, {
      onSettled: () => setWithdrawingId(null),
    });
  };

  return (
    <PageLayout title="Мои отклики">
      {showFilter && (
        <Box
          sx={{
            top: 0,
            zIndex: 1000,
            position: 'sticky',
          }}
        >
          <MyResponsesFilter
            status={status}
            companyId={companyId}
            updatedDate={updatedDate}
            companyOptions={companyOptions}
            onStatusChange={setStatus}
            onCompanyChange={setCompanyId}
            onUpdatedDateChange={setUpdatedDate}
          />
        </Box>
      )}

      {isInitialLoading && <MyResponseItemSkeletonList count={6} />}

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
            sx={{ alignItems: 'center', maxWidth: 400 }}
          >
            <ReplyAllOutlined
              sx={{ fontSize: 56, color: 'text.disabled' }}
            />
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {hasActiveFilters
                ? 'По выбранным фильтрам ничего не найдено'
                : 'У вас пока нет откликов'}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center' }}
            >
              {hasActiveFilters
                ? 'Попробуйте изменить фильтры или сбросить их'
                : 'Откликайтесь на объявления на главной — они появятся здесь'}
            </Typography>
            <Button
              variant="contained"
              onClick={() =>
                hasActiveFilters
                  ? handleResetFilters()
                  : navigate(ROUTES.INDEX)
              }
            >
              {hasActiveFilters ? 'Сбросить фильтры' : 'На главную'}
            </Button>
          </Stack>
        </Box>
      )}

      {!isInitialLoading && !isError && visibleApplications.length > 0 && (
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
          {visibleApplications.map(application => {
            const postId = application.post?.id ?? '';
            const task = postId
              ? executorTasksByPostMap?.get(postId)
              : undefined;

            return (
              <MyResponseItem
                key={application.id}
                application={application}
                withdrawingId={withdrawingId}
                onWithdraw={handleWithdraw}
                isFavorite={favoritePostIds.has(postId)}
                taskId={task?.id ?? null}
              />
            );
          })}
        </Box>
      )}

      {!isInitialLoading && !isError && visibleApplications.length > 0 && (
        <InfiniteScrollSentinel
          hasMore={Boolean(hasNextPage)}
          isLoading={isFetchingNextPage}
          onLoadMore={() => void fetchNextPage()}
        />
      )}
    </PageLayout>
  );
};

export default MyResponses;
