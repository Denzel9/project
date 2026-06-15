import { NorthEast, Whatshot } from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';

import { useMyApplicationsMap } from '@/entities/application';
import { useFavoritePostIds } from '@/entities/favorite';
import { usePostByIdQuery } from '@/entities/post';
import { getUserName, useGetUserByIdQuery } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { ROUTES, ShareButton } from '@/shared';
import { Media, PageLayout } from '@/widgets';
import { Action } from '@/widgets/post-item/ui/Action';

import { IncomingApplications } from './IncomingApplications';

export const PostPage = () => {
  const { id } = useParams<{ id: string }>();

  const { id: currentUserId } = useAuthStore();

  const navigate = useNavigate();

  const { data: post, isLoading } = usePostByIdQuery(id ?? null);

  const { data: user } = useGetUserByIdQuery(post?.ownerId ?? null);

  const favoritePostIds = useFavoritePostIds();

  const myApplicationsMap = useMyApplicationsMap();

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

      {post && (
        <Box
          sx={{
            mt: 2,
            bgcolor: 'white',
            borderRadius: { xs: '16px', md: '32px' },
            p: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', lg: 'row' },
              gap: 3,
            }}
          >
            {mediaItems.length > 0 && <Media items={mediaItems} />}

            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <Typography variant="h3">{post.title}</Typography>

                  {post.urgent && (
                    <Whatshot
                      color="error"
                      sx={{ fontSize: 44 }}
                    />
                  )}
                </Stack>

                <ShareButton
                  postId={post.id}
                  title={post.title}
                />
              </Stack>

              <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {post.chips?.map(chip => (
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
                <Typography variant="h4">{getUserName(user?.data)}</Typography>

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
                sx={{ mt: 1 }}
              />

              <Typography
                variant="body1"
                sx={{ mt: 6, whiteSpace: 'pre-wrap' }}
              >
                {post.description}
              </Typography>

              {!isOwner && (
                <Action
                  postId={post.id}
                  ownerId={post.ownerId}
                  applicationId={application?.id}
                  isApplied={Boolean(application)}
                  applicationStatus={application?.status}
                  isFavorite={favoritePostIds.has(post.id)}
                  removePostFromCollection={removePostFromCollection}
                />
              )}
            </Box>
          </Box>

          {isOwner && (
            <>
              <Divider />
              <IncomingApplications postId={post.id} />
            </>
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default PostPage;
