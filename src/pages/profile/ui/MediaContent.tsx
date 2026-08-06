import { Box, Stack } from '@mui/material';
import { keepPreviousData } from '@tanstack/react-query';

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
  const ownerId = userId || id || '';

  const {
    data,
    isLoading,
    isPlaceholderData,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = usePostsInfiniteQuery(
    {
      limit: 20,
      isArchived,
      ownerId,
      isPrivate: isPrivate ? true : undefined,
    },
    { placeholderData: keepPreviousData },
  );

  const posts = data?.pages.flatMap(page => page.items) ?? [];
  const isInitialLoading = isLoading && !posts.length;
  const isEmpty = !isInitialLoading && !posts.length;

  const postPermissions = getPostPermissions({
    isActive,
    isPrivate,
  });

  if (isInitialLoading) {
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
      {!isEmpty && (
        <Stack
          spacing={1}
          direction="column"
          sx={{
            opacity: isPlaceholderData ? 0.72 : 1,
            transition: 'opacity 120ms ease',
          }}
        >
          {posts.map(post => (
            <Box
              key={post.id}
              sx={{ bgcolor: 'white', borderRadius: '32px' }}
            >
              <PostItem
                isCompact
                post={post}
                isPrivate={isPrivate}
                permissions={postPermissions}
                isMyPost={post.owner.id === id}
                isCompany={post.owner.id === id}
              />
            </Box>
          ))}
        </Stack>
      )}

      {isEmpty && (
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
        hasMore={Boolean(hasNextPage) && !isPlaceholderData}
      />
    </Box>
  );
};
