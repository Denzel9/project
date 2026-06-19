import { Box, Stack, Typography } from '@mui/material';

import { usePostsInfiniteQuery } from '@/entities/post';
import { useAuthStore } from '@/features/auth';
import { InfiniteScrollSentinel } from '@/shared';
import { ACTION_BUTTONS_KEYS, PostItem, PostItemSkeletonList } from '@/widgets';

import { MEDIA_TAB_VALUES, type MediaContentProps } from '../model/types';

export const MediaContent = ({ userId, mediaTabValue }: MediaContentProps) => {
  const { id } = useAuthStore();

  const isArchived = mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePostsInfiniteQuery({
      ownerId: userId || id || '',
      isArchived,
      limit: 20,
    });

  const posts = data?.pages.flatMap(page => page.items) ?? [];

  const postPermissions = isArchived
    ? [
        ACTION_BUTTONS_KEYS.EDIT,
        ACTION_BUTTONS_KEYS.DELETE,
        ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
      ]
    : [
        ACTION_BUTTONS_KEYS.EDIT,
        ACTION_BUTTONS_KEYS.DELETE,
        ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
      ];

  if (isLoading && !posts.length) {
    return (
      <Box>
        <PostItemSkeletonList
          count={5}
          isCompact
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ borderRadius: '32px' }}>
        {mediaTabValue === MEDIA_TAB_VALUES.ACTIVE && (
          <Stack
            spacing={2}
            direction="column"
          >
            {posts.map(post => (
              <Box
                key={post.id}
                sx={{ bgcolor: 'white', borderRadius: '32px' }}
              >
                <PostItem
                  isMyPost
                  isCompact
                  post={post}
                  permissions={postPermissions}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED && (
        <Stack
          direction="column"
          spacing={2}
        >
          {posts.map(post => (
            <PostItem
              isMyPost
              isCompact
              post={post}
              key={post.id}
              permissions={postPermissions}
            />
          ))}
        </Stack>
      )}

      {!isLoading && !posts.length && (
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            bgcolor: 'white',
            alignItems: 'center',
            borderRadius: '32px',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h4"
            color="info"
            sx={{ textAlign: 'center', py: 6 }}
          >
            Посты не найдены
          </Typography>
        </Box>
      )}

      <InfiniteScrollSentinel
        hasMore={Boolean(hasNextPage)}
        isLoading={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </Box>
  );
};
