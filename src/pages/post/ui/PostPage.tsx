import { NorthEast, Whatshot } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Rating,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';

import {
  useMyApplicationsMap,
  usePostApplicationsQuery,
} from '@/entities/application';
import { useFavoritePostIds } from '@/entities/favorite';
import { usePostByIdQuery } from '@/entities/post';
import { getUserName, useGetUserByIdQuery } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { DeletePostDialog } from '@/features/delete-post';
import { ROUTES, ShareButton } from '@/shared';
import { Media, PageLayout } from '@/widgets';
import { Action } from '@/widgets/post-item/ui/Action';

import { IncomingApplications } from './IncomingApplications';

export const PostPage = () => {
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab');

  const { id } = useParams<{ id: string }>();

  const { id: currentUserId } = useAuthStore();

  const navigate = useNavigate();

  const { data: post, isLoading } = usePostByIdQuery(id ?? null);

  const { data: user } = useGetUserByIdQuery(post?.ownerId ?? null);

  const { data: postApplications, isLoading: isPostApplicationsLoading } =
    usePostApplicationsQuery(post?.id || null, {
      page: 1,
      limit: 20,
    });

  const { favoritePostIds } = useFavoritePostIds();

  const { map: myApplicationsMap } = useMyApplicationsMap();

  useEffect(() => {
    if (tab) {
      setTimeout(() => {
        setTabValue(Number(tab));
      }, 0);
    }
  }, [tab]);

  const removePostFromCollection = (postId: string) => {
    myApplicationsMap.delete(postId);
  };

  const isOwner = Boolean(
    post && currentUserId && post.ownerId === currentUserId
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
                label={postApplications?.items?.length}
                size="small"
                color="primary"
              />
            </Stack>
          }
        />
      </Tabs>

      {tabValue === 0 && (
        <Box
          sx={{
            gap: 3,
            bgcolor: 'white',
            display: 'flex',
            p: { xs: 2, md: 4 },
            flexDirection: 'column',
            borderRadius: { xs: '16px', md: '32px' },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 3,
            }}
          >
            {Boolean(post?.media?.length) && (
              <Box
                sx={{
                  width: { xs: '100%', md: '550px' },
                  height: { xs: '400px', md: '500px' },
                }}
              >
                <Media items={mediaItems} />
              </Box>
            )}

            <Box sx={{ flex: 1, position: 'relative' }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack
                  spacing={1}
                  direction="row"
                  sx={{ alignItems: 'center' }}
                >
                  <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                    {post?.title}
                  </Typography>

                  {post?.urgent && (
                    <Whatshot
                      color="error"
                      sx={{ fontSize: 44 }}
                    />
                  )}
                </Stack>

                <ShareButton
                  postId={post?.id ?? ''}
                  title={post?.title ?? ''}
                />
              </Stack>

              <Box sx={{ width: { xs: '100%', md: '90%' } }}>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {post?.chips?.map(chip => (
                    <Chip
                      key={chip}
                      label={chip}
                    />
                  ))}
                </Box>

                <Stack
                  spacing={1}
                  sx={{ mt: 6, alignItems: 'center' }}
                  direction="row"
                >
                  <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                    {getUserName(user?.data)}
                  </Typography>

                  <IconButton
                    onClick={() =>
                      navigate(`${ROUTES.PROFILE}?userId=${user?.data?.id}`)
                    }
                  >
                    <NorthEast />
                  </IconButton>
                </Stack>

                <Rating
                  readOnly
                  value={4.5}
                  precision={0.5}
                />

                <Typography
                  variant="body1"
                  sx={{ mt: 6, whiteSpace: 'pre-wrap' }}
                >
                  {post?.description}
                </Typography>
              </Box>

              {!isOwner && (
                <Action
                  postId={post?.id ?? ''}
                  ownerId={post?.ownerId ?? ''}
                  applicationId={application?.id}
                  isApplied={Boolean(application)}
                  applicationStatus={application?.status}
                  isFavorite={favoritePostIds.has(post?.id ?? '')}
                  removePostFromCollection={removePostFromCollection}
                />
              )}

              {isOwner && (
                <Stack
                  direction="row"
                  spacing={2}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      navigate(
                        `${ROUTES.MANAGE_APPLICATION}?id=${post?.id ?? ''}`
                      )
                    }
                  >
                    Редактировать
                  </Button>

                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setIsOpenDeleteDialog(true)}
                  >
                    Удалить
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {isOwner && tabValue === 1 && (
        <IncomingApplications
          applications={postApplications}
          isLoading={isPostApplicationsLoading}
        />
      )}

      <DeletePostDialog
        open={isOpenDeleteDialog}
        postId={post?.id ?? null}
        onClose={() => setIsOpenDeleteDialog(false)}
        onSuccess={() => navigate(ROUTES.INDEX)}
      />
    </PageLayout>
  );
};

export default PostPage;
