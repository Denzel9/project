import { Verified, Email, Phone, LocationOn, Edit } from '@mui/icons-material';
import {
  Box,
  Avatar,
  Stack,
  Typography,
  Skeleton,
  Button,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router';

import { getUserName, type User } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared';
import { FavoriteButton } from '@/widgets';

import { UserCardItem } from './UserCardItem';

export const UserCard = ({
  isLoading,
  user,
}: {
  isLoading: boolean;
  user: User | undefined;
}) => {
  const navigate = useNavigate();

  const { id: userId } = useAuthStore();

  const isMe = user?.id !== userId;

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
        boxShadow: { xs: 'none', md: '0 0 10px 0 rgba(0, 0, 0, 0.1)' },
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

          {isMe && (
            <IconButton
              sx={{ display: { xs: 'block', md: 'none' } }}
              onClick={() => navigate(ROUTES.SETTINGS_ACCOUNT)}
            >
              <Edit />
            </IconButton>
          )}
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', my: 4 }}
      >
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width="100%"
            height={24}
          />
        ) : (
          <>
            <Typography variant="h6">{getUserName(user)}</Typography>
            <Verified />
          </>
        )}
      </Stack>

      {isLoading ? (
        <Skeleton
          variant="rounded"
          width="100%"
          height={24}
        />
      ) : user?.bio ? (
        <UserCardItem
          value={user?.bio}
          isLoading={isLoading}
        />
      ) : null}

      <Stack
        spacing={2}
        direction="column"
        sx={{ mt: 4 }}
      >
        <UserCardItem
          value={user?.email || ''}
          isLoading={isLoading}
          icon={<Email />}
        />

        {user?.phone && (
          <UserCardItem
            value={user?.phone || ''}
            isLoading={isLoading}
            icon={<Phone />}
          />
        )}

        {user?.location && (
          <UserCardItem
            value={user?.location || ''}
            isLoading={isLoading}
            icon={<LocationOn />}
          />
        )}
      </Stack>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {!isMe && (
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
            {/* TODO: add postId to user */}
            <FavoriteButton
              postId={'postId'}
              isFavorite={false}
            />
          </Stack>
        )}
      </Box>
    </Box>
  );
};
