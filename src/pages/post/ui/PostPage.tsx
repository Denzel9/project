import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import {
  formatPostBudget,
  usePostByIdQuery,
  useGetUserByIdQuery,
  useMyApplicationsMap,
  usePostApplicationsQuery,
  useUpdatePostMutation,
  USER_ROLE,
} from '@/entities';
import { useAuthStore } from '@/features';
import { EmptyBlock, ROUTES } from '@/shared';
import { PageLayout, ContactCard, useSnackbarStore } from '@/widgets';

import {
  getPostApplicationApplicantOptions,
  hasActivePostApplicationFilters,
  toPostApplicationsQueryParams,
  type PostApplicationApplicantFilter,
  type PostApplicationStatusFilter,
} from '../model/utils';

import { IncomingApplications } from './IncomingApplications';
import { MainCard } from './MainCard';
import { PostApplicationsFilter } from './PostApplicationsFilter';
import { PostDetailsCard } from './PostDetailsCard';

export const PostPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [applicationStatusFilter, setApplicationStatusFilter] =
    useState<PostApplicationStatusFilter>('all');
  const [applicantId, setApplicantId] =
    useState<PostApplicationApplicantFilter>('all');
  const [createdDate, setCreatedDate] = useState<string | null>(null);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const { id } = useParams<{ id: string }>();

  const { id: currentUserId, role } = useAuthStore();

  const { data: post, isLoading } = usePostByIdQuery(id ?? null);
  const { mutateAsync: updatePost, isPending: isUpdatingPost } =
    useUpdatePostMutation();
  const { setSnackbarOpen } = useSnackbarStore();

  const { data: user } = useGetUserByIdQuery(post?.owner?.id ?? null);

  const optionsQueryParams = useMemo(
    () =>
      toPostApplicationsQueryParams({
        status: applicationStatusFilter,
        applicantId: 'all',
        createdDate,
      }),
    [applicationStatusFilter, createdDate]
  );

  const applicationQueryParams = useMemo(
    () =>
      toPostApplicationsQueryParams({
        status: applicationStatusFilter,
        applicantId,
        createdDate,
      }),
    [applicationStatusFilter, applicantId, createdDate]
  );

  const { data: postApplications, isLoading: isPostApplicationsLoading } =
    usePostApplicationsQuery(post?.id || null, applicationQueryParams, true);

  const { data: applicantSourceApplications } = usePostApplicationsQuery(
    post?.id || null,
    optionsQueryParams,
    true
  );

  const applicantOptions = useMemo(() => {
    const options = getPostApplicationApplicantOptions(
      applicantSourceApplications?.items ?? postApplications?.items ?? []
    );

    if (
      applicantId !== 'all' &&
      !options.some(option => option.id === applicantId)
    ) {
      options.unshift({
        id: applicantId,
        label: 'Выбранный кандидат',
      });
    }

    return options;
  }, [applicantId, applicantSourceApplications?.items, postApplications?.items]);

  const hasActiveFilters = hasActivePostApplicationFilters({
    status: applicationStatusFilter,
    applicantId,
    createdDate,
  });

  const { map: myApplicationsMap } = useMyApplicationsMap();

  const removePostFromCollection = (postId: string) => {
    myApplicationsMap.delete(postId);
  };

  useEffect(() => {
    if (tab) {
      setTimeout(() => {
        setTabValue(Number(tab));
      }, 0);
    }
  }, [tab]);

  const isOwner = Boolean(post?.owner?.id === currentUserId);
  const isCompanyPost = post?.type === 'COMPANY';
  const application = myApplicationsMap.get(post?.id ?? '');

  const handleUnarchive = async () => {
    if (!post || !isOwner || isUpdatingPost) return;

    try {
      await updatePost({ id: post.id, body: { isArchived: false } });
      setSnackbarOpen?.(true, 'Пост возвращен из архива');
    } catch {
      setSnackbarOpen?.(true, 'Не удалось вернуть пост из архива', 'error');
    }
  };

  const handleTogglePrivate = async () => {
    if (!post || !isOwner || isUpdatingPost) return;

    try {
      await updatePost({ id: post.id, body: { isPrivate: false } });
      setSnackbarOpen?.(true, 'Пост сделан публичным');
    } catch {
      setSnackbarOpen?.(true, 'Не удалось сделать пост публичным', 'error');
    }
  };

  const mediaItems =
    post?.media?.map(media => ({
      url: media.url,
      mimeType: media.mimeType,
    })) ?? [];

  if (isLoading) {
    return (
      <PageLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 320,
            bgcolor: 'white',
            borderRadius: '32px',
          }}
        >
          <CircularProgress />
        </Box>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 320,
            bgcolor: 'white',
            borderRadius: '32px',
          }}
        >
          <EmptyBlock
            title="Пост не найден"
            buttonText="На главную"
            buttonOnClick={() => navigate(ROUTES.INDEX)}
          />
        </Box>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Stack
        spacing={1}
        sx={{ flex: 1 }}
      >
        {isOwner && isCompanyPost && role === USER_ROLE.COMPANY && (
          <Stack
            direction="row"
            sx={{
              p: 2,
              width: '100%',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'white',
              borderRadius: '24px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{
                minHeight: 44,
                '& .MuiTab-root': {
                  minHeight: 44,
                  textTransform: 'none',
                  fontWeight: 500,
                },
              }}
            >
              <Tab
                value={0}
                label="Описание"
              />
              <Tab
                value={1}
                label={
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center' }}
                  >
                    <span>Отклики</span>
                    <Chip
                      size="small"
                      color="primary"
                      label={postApplications?.total ?? postApplications?.items?.length ?? 0}
                    />
                  </Stack>
                }
              />
            </Tabs>

            {isOwner && isCompanyPost && role === USER_ROLE.COMPANY && tabValue === 1 && (
              <PostApplicationsFilter
                status={applicationStatusFilter}
                applicantId={applicantId}
                createdDate={createdDate}
                applicantOptions={applicantOptions}
                onStatusChange={setApplicationStatusFilter}
                onApplicantChange={setApplicantId}
                onCreatedDateChange={setCreatedDate}
              />
            )}
          </Stack>
        )}

        {tabValue === 0 && (
          <Stack spacing={1}>
            {post.isArchived && (
              <Stack
                spacing={1}
                direction="row"
                sx={{
                  p: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderRadius: '24px',
                  alignItems: 'center',
                  borderColor: 'divider',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6" color="info" sx={{ fontWeight: 600 }}>
                  Обьявление в архиве
                </Typography>

                {isOwner && (
                  <Button
                    sx={{ px: 2 }}
                    variant="text"
                    color="primary"
                    disabled={isUpdatingPost}
                    onClick={() => void handleUnarchive()}
                  >
                    Вернуть из архива
                  </Button>
                )}
              </Stack>
            )}

            {post.isPrivate && (
              <Stack
                spacing={1}
                direction="row"
                sx={{
                  p: 2,
                  bgcolor: 'white',
                  border: '1px solid',
                  borderRadius: '24px',
                  alignItems: 'center',
                  borderColor: 'divider',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="h6" color="info" sx={{ fontWeight: 600 }}>
                  Приватное обьявление
                </Typography>

                {isOwner && (
                  <Button
                    sx={{ px: 2 }}
                    variant="text"
                    color="primary"
                    disabled={isUpdatingPost}
                    onClick={() => void handleTogglePrivate()}
                  >
                    Сделать публичным
                  </Button>
                )}
              </Stack>
            )}

            <MainCard
              post={post}
              user={user?.data}
              isOwner={isOwner}
              mediaItems={mediaItems}
              application={application}
              removePostFromCollection={removePostFromCollection}
            />

            {!isOwner && post.budget && (
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: 'white',
                  borderRadius: '24px',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: { xs: 'block', lg: 'none' },
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {isCompanyPost ? 'Бюджет' : 'Ставка'}
                </Typography>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ fontWeight: 600 }}
                >
                  {formatPostBudget(post.budget)}
                </Typography>
              </Box>
            )}

            <Stack
              spacing={1}
              direction={{ xs: 'column', lg: 'row' }}
              sx={{ alignItems: 'flex-start' }}
            >
              <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                <PostDetailsCard
                  post={post}
                  isCompanyPost={isCompanyPost}
                />
              </Box>

              {!isOwner && (
                <Box
                  sx={{
                    width: { xs: '100%', lg: '30%' },
                    flexShrink: 0,
                    position: { lg: 'sticky' },
                    top: { lg: 16 },
                  }}
                >
                  <ContactCard
                    withTitle
                    taskId={post.id}
                    isMyPost={isOwner}
                    contact={user?.data}
                    roleLabel={isCompanyPost ? 'Заказчик' : 'Исполнитель'}
                  />
                </Box>
              )}
            </Stack>
          </Stack>
        )}

        {isOwner && tabValue === 1 && (
          <IncomingApplications
            applications={postApplications}
            isLoading={isPostApplicationsLoading}
            emptyTitle={
              hasActiveFilters
                ? 'Нет откликов по выбранным фильтрам'
                : undefined
            }
          />
        )}
      </Stack>
    </PageLayout >
  );
};

export default PostPage;
