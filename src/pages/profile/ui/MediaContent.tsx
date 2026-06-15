import { Box, Stack, Typography } from '@mui/material';

import { usePostsQuery } from '@/entities/post';
import { useAuthStore } from '@/features/auth';
import { ACTION_BUTTONS_KEYS, PostItem, DeleteDialog } from '@/widgets';

import { MEDIA_TAB_VALUES, type MediaContentProps } from '../model/types';

export const MediaContent = ({ userId, mediaTabValue }: MediaContentProps) => {
  const { id } = useAuthStore();

  const { data: posts } = usePostsQuery({
    ownerId: userId || id || '',
    isArchived: mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED,
  });

  return (
    <Box>
      <Box
        sx={{
          pb: 4,
          borderRadius: '32px',
        }}
      >
        {mediaTabValue === MEDIA_TAB_VALUES.ACTIVE && (
          <Stack
            spacing={2}
            direction="column"
          >
            {posts?.items?.map(post => (
              <Box
                key={post.id}
                sx={{ bgcolor: 'white', borderRadius: '32px' }}
              >
                <PostItem
                  isMyPost
                  isCompact
                  post={post}
                  key={post.id}
                  permissions={[
                    ACTION_BUTTONS_KEYS.EDIT,
                    ACTION_BUTTONS_KEYS.DELETE,
                    ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
                    ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
                  ]}
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
          {posts?.items?.map(post => (
            <PostItem
              isMyPost
              isCompact
              post={post}
              key={post.id}
              permissions={[
                ACTION_BUTTONS_KEYS.EDIT,
                ACTION_BUTTONS_KEYS.DELETE,
              ]}
            />
          ))}
        </Stack>
      )}

      {!posts?.items?.length && (
        <Typography
          variant="h4"
          color="info"
          sx={{ textAlign: 'center', py: 6 }}
        >
          Посты не найдены
        </Typography>
      )}

      <DeleteDialog />
    </Box>
  );
};
