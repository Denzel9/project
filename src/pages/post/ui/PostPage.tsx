import {
  Box,
  Chip,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';

import {
  useMyApplicationsMap,
  usePostApplicationsQuery,
} from '@/entities/application';
import { getApplicationsCountLabel, usePostByIdQuery } from '@/entities/post';
import { useGetUserByIdQuery } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { PageLayout } from '@/widgets';

import { ContactCard } from './ContactCard';
import { IncomingApplications } from './IncomingApplications';
import { MainCard } from './MainCard';
import { PostDetailsCard } from './PostDetailsCard';

export const PostPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const { id } = useParams<{ id: string }>();

  const { id: currentUserId } = useAuthStore();

  const { data: post, isLoading } = usePostByIdQuery(id ?? null);

  const { data: user } = useGetUserByIdQuery(post?.owner?.id ?? null);

  const { data: postApplications, isLoading: isPostApplicationsLoading } =
    usePostApplicationsQuery(post?.id || null, {
      page: 1,
      limit: 20,
    });

  const { map: myApplicationsMap } = useMyApplicationsMap();

  const removePostFromCollection = (postId: string) => {
    myApplicationsMap.delete(postId);
  };

  const isMyPost = Boolean(post?.owner?.id === currentUserId);

  useEffect(() => {
    if (tab) {
      setTimeout(() => {
        setTabValue(Number(tab));
      }, 0);
    }
  }, [tab]);

  const isOwner = Boolean(
    post && currentUserId && post.owner?.id === currentUserId
  );
  const application = post ? myApplicationsMap.get(post.id) : undefined;

  const mediaItems =
    post?.media?.map(media => ({
      url: media.url,
      mimeType: media.mimeType,
    })) ?? [];

  return (
    <PageLayout>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !post && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 6 }}
        >
          Пост не найден
        </Typography>
      )}

      {isMyPost && (
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ mb: 2, ml: 2 }}
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
              >
                <Typography variant="body1">Отклики</Typography>
                <Chip
                  label={getApplicationsCountLabel(
                    postApplications?.items || []
                  )}
                  size="small"
                  color="primary"
                />
              </Stack>
            }
          />
        </Tabs>
      )}

      {tabValue === 0 && (
        <Stack
          spacing={2}
          direction="column"
        >
          <MainCard
            post={post}
            user={user?.data}
            isOwner={isOwner}
            mediaItems={mediaItems}
            application={application}
            removePostFromCollection={removePostFromCollection}
          />

          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
          >
            <Box sx={{ flex: { xs: '1 1 auto', lg: '1 1 70%' } }}>
              {post && <PostDetailsCard post={post} />}
            </Box>

            <Box sx={{ width: { xs: '100%', lg: '30%' } }}>
              <ContactCard
                contact={user?.data}
                isMyPost={isMyPost}
              />
            </Box>
          </Stack>
        </Stack>
      )}

      {isOwner && tabValue === 1 && (
        <IncomingApplications
          applications={postApplications}
          isLoading={isPostApplicationsLoading}
        />
      )}
    </PageLayout>
  );
};

export default PostPage;
