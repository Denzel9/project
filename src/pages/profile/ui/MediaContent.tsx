import { Box, Stack, ButtonGroup, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router';

import { usePostsQuery } from '@/entities/post';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared';
import { ACTION_BUTTONS_KEYS, PostItem, DeleteDialog } from '@/widgets';

import { MEDIA_TAB_VALUES, type MediaContentProps } from '../model/types';

export const MediaContent = ({
  userId,
  mediaTabValue,
  setMediaTabValue,
}: MediaContentProps) => {
  const navigate = useNavigate();

  const { id } = useAuthStore();

  const { data: posts } = usePostsQuery({
    ownerId: userId || id || '',
    isArchived: mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED,
  });

  return (
    <Box sx={{ mt: 4 }}>
      <Stack
        direction="row"
        sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <ButtonGroup size="small">
            <Button
              onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.ACTIVE)}
              color={
                mediaTabValue === MEDIA_TAB_VALUES.ACTIVE ? 'primary' : 'info'
              }
            >
              Активные
            </Button>
            <Button
              onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.ARCHIVED)}
              color={
                mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED ? 'primary' : 'info'
              }
            >
              Архивные
            </Button>
          </ButtonGroup>

          <Button
            size="small"
            sx={{ ml: 2 }}
            variant="contained"
            onClick={() => navigate(ROUTES.MANAGE_APPLICATION)}
          >
            Добавить
          </Button>
        </Box>

        <Typography
          color="info"
          variant="subtitle1"
        >
          Доступно: 5
        </Typography>
      </Stack>

      {mediaTabValue === MEDIA_TAB_VALUES.ACTIVE && (
        <Stack
          direction="column"
          spacing={2}
        >
          {posts?.items?.map(post => (
            <PostItem
              isCompact
              post={post}
              key={post.id}
              isMyPost
              permissions={[
                ACTION_BUTTONS_KEYS.EDIT,
                ACTION_BUTTONS_KEYS.DELETE,
                ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
                ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
              ]}
            />
          ))}
        </Stack>
      )}

      {mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED && (
        <Stack
          direction="column"
          spacing={2}
        >
          {posts?.items?.map(post => (
            <PostItem
              isCompact
              post={post}
              key={post.id}
              isMyPost
              permissions={[
                ACTION_BUTTONS_KEYS.EDIT,
                ACTION_BUTTONS_KEYS.DELETE,
              ]}
            />
          ))}
        </Stack>
      )}

      {!posts?.items?.length && (
        <Stack
          direction="column"
          spacing={2}
          sx={{
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h4"
            color="info"
          >
            Посты не найдены
          </Typography>
        </Stack>
      )}

      <DeleteDialog />
    </Box>
  );
};
