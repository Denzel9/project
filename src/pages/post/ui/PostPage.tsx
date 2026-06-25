import {
  Box,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
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
} from '@/entities';
import { useAuthStore } from '@/features';
import { EmptyBlock, ROUTES } from '@/shared';
import { PageLayout, ContactCard } from '@/widgets';

import {
  POST_APPLICATION_STATUS_FILTER_LABELS,
  filterPostApplicationsByStatus,
  toPostApplicationsQueryParams,
  type PostApplicationStatusFilter,
} from '../model/utils';

import { IncomingApplications } from './IncomingApplications';
import { MainCard } from './MainCard';
import { PostDetailsCard } from './PostDetailsCard';

export const PostPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [applicationStatusFilter, setApplicationStatusFilter] =
    useState<PostApplicationStatusFilter>('all');

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const { id } = useParams<{ id: string }>();

  const { id: currentUserId } = useAuthStore();

  const { data: post, isLoading } = usePostByIdQuery(id ?? null);

  const { data: user } = useGetUserByIdQuery(post?.owner?.id ?? null);

  const applicationQueryParams = useMemo(
    () => toPostApplicationsQueryParams(applicationStatusFilter),
    [applicationStatusFilter]
  );

  const { data: postApplications, isLoading: isPostApplicationsLoading } =
    usePostApplicationsQuery(post?.id || null, applicationQueryParams, true);

  const filteredApplications = useMemo(
    () =>
      filterPostApplicationsByStatus(postApplications, applicationStatusFilter),
    [postApplications, applicationStatusFilter]
  );

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
  const application = myApplicationsMap.get(post?.id ?? '');

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
        spacing={2}
        sx={{ flex: 1 }}
      >
        {isOwner && (
          <Stack
            direction="row"
            sx={{
              width: '100%',
              px: { xs: 1, md: 2 },
              pt: { xs: 1, md: 0 },
              justifyContent: 'space-between',
              alignItems: 'center',
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
                      label={filteredApplications?.items?.length ?? 0}
                    />
                  </Stack>
                }
              />
            </Tabs>

            {tabValue === 1 && (
              <TextField
                select
                size="small"
                label="Статус"
                value={applicationStatusFilter}
                sx={{ minWidth: 160 }}
                onChange={event =>
                  setApplicationStatusFilter(
                    event.target.value as PostApplicationStatusFilter
                  )
                }
              >
                {(
                  Object.entries(POST_APPLICATION_STATUS_FILTER_LABELS) as [
                    PostApplicationStatusFilter,
                    string,
                  ][]
                ).map(([value, label]) => (
                  <MenuItem
                    key={value}
                    value={value}
                  >
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        )}

        {tabValue === 0 && (
          <Stack spacing={2}>
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
                  display: { xs: 'block', lg: 'none' },
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Бюджет
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
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              sx={{ alignItems: 'flex-start' }}
            >
              <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                <PostDetailsCard post={post} />
              </Box>

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
                  isMyPost={isOwner}
                  contact={user?.data}
                  taskId={post.id}
                />
              </Box>
            </Stack>
          </Stack>
        )}

        {isOwner && tabValue === 1 && (
          <IncomingApplications
            applications={filteredApplications}
            isLoading={isPostApplicationsLoading}
            emptyTitle={
              applicationStatusFilter !== 'all' &&
              Boolean(postApplications?.items?.length)
                ? 'Нет откликов с выбранным статусом'
                : undefined
            }
          />
        )}
      </Stack>
    </PageLayout>
  );
};

export default PostPage;
