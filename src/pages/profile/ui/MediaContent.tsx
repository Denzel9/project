import { Box, Stack } from '@mui/material';
import { keepPreviousData } from '@tanstack/react-query';

import { usePostsInfiniteQuery } from '@/entities/post';
import { useAuthStore } from '@/features/auth';
import { EmptyBlock, InfiniteScrollSentinel } from '@/shared';
import { PostItem, PostItemSkeletonList } from '@/widgets';

import { MEDIA_TAB_VALUES, type MediaContentProps } from '../model/types';
import { getPostPermissions } from '../model/utils';

export const MediaContent = ({ tabValue, userId, mediaTabValue }: MediaContentProps) => {
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
      <Box sx={{ display: tabValue === 0 ? 'block' : 'none' }}>
        <PostItemSkeletonList
          count={5}
          isCompact
        />
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: tabValue === 0 ? 'block' : 'none' }}>
      {!isEmpty && (
        <Stack
          spacing={1}
          direction="column"
          sx={{
            transition: 'opacity 120ms ease',
            opacity: isPlaceholderData ? 0.72 : 1,
          }}
        >
          {posts.map(post => (
            <PostItem
              isCompact
              post={post}
              key={post.id}
              isPrivate={isPrivate}
              permissions={postPermissions}
              isMyPost={post.owner.id === id}
              isCompany={Boolean(post.owner.companyProfile?.companyName)}
            />
          ))}
        </Stack>
      )}

      {isEmpty && (
        <Box
          sx={{
            height: '100%',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderRadius: '32px',
            borderColor: 'divider',
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
