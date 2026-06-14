import { Add } from '@mui/icons-material';
import {
  Box,
  Stack,
  ButtonGroup,
  Button,
  Typography,
  IconButton,
  TextField,
  MenuItem,
} from '@mui/material';
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
    <Box sx={{ mt: { xs: 2, md: 4 } }}>
      <Stack
        direction="row"
        sx={{
          mb: { xs: 4, md: 2 },
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            gap: 2,
            px: { xs: 2, md: 0 },
            display: 'flex',
            width: { xs: '100%', md: 'auto' },
          }}
        >
          <ButtonGroup sx={{ display: { xs: 'none', md: 'block' } }}>
            <Button
              size="small"
              onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.ACTIVE)}
              color={
                mediaTabValue === MEDIA_TAB_VALUES.ACTIVE ? 'primary' : 'info'
              }
            >
              Активные
            </Button>

            <Button
              size="small"
              onClick={() => setMediaTabValue(MEDIA_TAB_VALUES.ARCHIVED)}
              color={
                mediaTabValue === MEDIA_TAB_VALUES.ARCHIVED ? 'primary' : 'info'
              }
            >
              Архивные
            </Button>
          </ButtonGroup>

          <TextField
            fullWidth
            select
            size="small"
            label="Поиск"
            variant="outlined"
            value={mediaTabValue}
            sx={{ display: { xs: 'block', md: 'none' } }}
            onChange={e => setMediaTabValue(e.target.value as MEDIA_TAB_VALUES)}
          >
            <MenuItem value={MEDIA_TAB_VALUES.ACTIVE}>Активные</MenuItem>
            <MenuItem value={MEDIA_TAB_VALUES.ARCHIVED}>Архивные</MenuItem>
          </TextField>

          <Button
            size="small"
            variant="contained"
            sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}
            onClick={() => navigate(ROUTES.MANAGE_APPLICATION)}
          >
            Добавить
          </Button>

          <IconButton
            size="small"
            sx={{ display: { xs: 'block', md: 'none' } }}
            onClick={() => navigate(ROUTES.MANAGE_APPLICATION)}
          >
            <Add />
          </IconButton>
        </Box>

        <Typography
          sx={{ display: { xs: 'none', md: 'block' } }}
          color="info"
          variant="subtitle1"
        >
          Доступно: 5
        </Typography>
      </Stack>

      <Box
        sx={{
          pb: 4,
          bgcolor: 'white',
          borderRadius: '32px',
          pt: { xs: 4, md: 0 },
          boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        {mediaTabValue === MEDIA_TAB_VALUES.ACTIVE && (
          <Stack
            spacing={2}
            direction="column"
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
                  ACTION_BUTTONS_KEYS.ADD_TO_ARCHIVE,
                  ACTION_BUTTONS_KEYS.REMOVE_FROM_ARCHIVE,
                ]}
              />
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
