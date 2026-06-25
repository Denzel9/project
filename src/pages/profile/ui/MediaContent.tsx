import { Box, Stack } from '@mui/material';

import { usePostsInfiniteQuery } from '@/entities/post';
import { useAuthStore } from '@/features/auth';
import { EmptyBlock, InfiniteScrollSentinel } from '@/shared';
import { PostItem, PostItemSkeletonList } from '@/widgets';

import { MEDIA_TAB_VALUES, type MediaContentProps } from '../model/types';
import { getPostPermissions } from '../model/utils';

export const MediaContent = ({ userId, mediaTabValue }: MediaContentProps) => {
  const { id } = useAuthStore();

  const isActive = mediaTabValue === MEDIA_TAB_VALUES.ACTIVE;
  const isPrivate = mediaTabValue === MEDIA_TAB_VALUES.PRIVATE;
  const isArchived = mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePostsInfiniteQuery({
      limit: 20,
      isArchived,
      ownerId: userId || id || '',
      isPrivate: isPrivate ? true : undefined,
    });

  const posts = data?.pages.flatMap(page => page.items) ?? [];

  const postPermissions = getPostPermissions({
    isActive,
    isPrivate,
  });

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
                  isCompact
                  post={post}
                  permissions={postPermissions}
                  isMyPost={post.owner.id === id}
                  isCompany={post.owner.id === id}
                />
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED && (
        <Stack
          spacing={2}
          direction="column"
        >
          {posts.map(post => (
            <PostItem
              isCompact
              post={post}
              key={post.id}
              permissions={postPermissions}
              isMyPost={post.owner.id === id}
              isCompany={post.owner.id === id}
            />
          ))}
        </Stack>
      )}

      {mediaTabValue === MEDIA_TAB_VALUES.PRIVATE && (
        <Stack
          spacing={2}
          direction="column"
        >
          {posts.map(post => (
            <PostItem
              isCompact
              isPrivate
              post={post}
              key={post.id}
              permissions={postPermissions}
              isMyPost={post.owner.id === id}
              isCompany={post.owner.id === id}
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
          <EmptyBlock title="Посты не найдены" />
        </Box>
      )}

      <InfiniteScrollSentinel
        onLoadMore={fetchNextPage}
        isLoading={isFetchingNextPage}
        hasMore={Boolean(hasNextPage)}
      />
    </Box>
  );
};
