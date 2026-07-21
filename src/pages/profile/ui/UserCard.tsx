import {
  Edit,
  FavoriteBorder,
  AutoAwesomeMotionOutlined,
  EmailOutlined,
  PhoneOutlined,
  LocationOnOutlined,
  MoreVert,
} from '@mui/icons-material';
import {
  Box,
  Avatar,
  Stack,
  Skeleton,
  Button,
  IconButton,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useFavoriteUserIds } from '@/entities/favorite';
import { UserDisplayName, type User } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared';
import { UserFavoriteButton } from '@/widgets';

import { UserCardItem } from './UserCardItem';

export const UserCard = ({
  isLoading,
  user,
}: {
  isLoading: boolean;
  user: User | undefined;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();

  const { id: userId } = useAuthStore();
  const { favoriteUserIds } = useFavoriteUserIds();

  return (
    <Box
      sx={{
        p: 4,
        zIndex: 3,
        top: '16px',
        bgcolor: 'white',
        borderRadius: '32px',
        maxWidth: { xs: '100%', md: '350px' },
        minWidth: { xs: '100%', md: '350px' },
        position: { xs: 'relative', md: 'sticky' },
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'start', md: 'center' },
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            width: '100%',
            alignItems: 'start',
            justifyContent: { xs: 'space-between', md: 'center' },
          }}
        >
          <Avatar
            src={user?.avatar || ''}
            sx={{ width: '200px', height: '200px' }}
          />

          {user?.id === userId ? (
            <IconButton
              sx={{ display: { xs: 'block', md: 'none' } }}
              onClick={() => navigate(ROUTES.SETTINGS_ACCOUNT)}
            >
              <Edit />
            </IconButton>
          ) : (
            <IconButton
              onClick={e => setAnchorEl(e.currentTarget)}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MoreVert />
            </IconButton>
          )}

          <Menu
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem>
              <Typography>Пожаловаться</Typography>
            </MenuItem>

            <MenuItem>
              <Typography>Поделиться</Typography>
            </MenuItem>
          </Menu>
        </Stack>
      </Box>

      <UserDisplayName
        user={user}
        sx={{ mt: 4 }}
        isLoading={isLoading}
      />

      {/* // TODO: do this */}
      <Stack
        spacing={2}
        direction="row"
        sx={{ mb: 4, color: 'text.secondary' }}
      >
        <Tooltip title="Пользователи, которые добавили этого пользователя в избранное">
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center' }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              134
            </Typography>
            <FavoriteBorder />
          </Stack>
        </Tooltip>

        <Tooltip title="Кол-во выполненных работ пользователем">
          <Stack
            spacing={1}
            direction="row"
            sx={{ alignItems: 'center' }}
          >
            <Typography
              variant="subtitle2"
              color="text.secondary"
            >
              548
            </Typography>
            <AutoAwesomeMotionOutlined />
          </Stack>
        </Tooltip>
      </Stack>

      {isLoading ? (
        <Skeleton
          width="100%"
          height={24}
          variant="rounded"
        />
      ) : user?.bio ? (
        <UserCardItem
          type="text"
          value={user?.bio}
          isLoading={isLoading}
        />
      ) : null}

      <Stack
        spacing={2}
        sx={{ mt: 4 }}
        direction="column"
      >
        <UserCardItem
          type="email"
          icon={<EmailOutlined />}
          isLoading={isLoading}
          value={user?.email || ''}
        />

        {user?.phone && (
          <UserCardItem
            type="phone"
            icon={<PhoneOutlined />}
            isLoading={isLoading}
            value={user?.phone || ''}
          />
        )}

        {user?.location && (
          <UserCardItem
            type="location"
            icon={<LocationOnOutlined />}
            isLoading={isLoading}
            value={user?.location || ''}
          />
        )}
      </Stack>

      {user?.id !== userId && (
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Stack
            spacing={2}
            direction="row"
            sx={{ alignItems: 'center', mt: 4 }}
          >
            <Button
              size="small"
              sx={{ px: 0 }}
              onClick={() => navigate(`${ROUTES.CHAT}?recipientId=${user?.id}`)}
            >
              Написать сообщение
            </Button>
            <UserFavoriteButton
              userId={user?.id ?? ''}
              isFavorite={favoriteUserIds.has(user?.id ?? '')}
            />
          </Stack>
        </Box>
      )}
    </Box>
  );
};
