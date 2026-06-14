import { Verified, Email, Phone, LocationOn } from '@mui/icons-material';
import { Box, Avatar, Stack, Typography, Skeleton } from '@mui/material';

import { getUserName, type User } from '@/entities/user';

import { UserCardItem } from './UserCardItem';

export const UserCard = ({
  isLoading,
  user,
}: {
  isLoading: boolean;
  user: User | undefined;
}) => {
  return (
    <Box
      sx={{
        p: 4,
        zIndex: 3,
        top: '16px',
        bgcolor: 'white',
        maxWidth: { xs: '100%', md: '350px' },
        minWidth: { xs: '100%', md: '350px' },
        position: { xs: 'relative', md: 'sticky' },
        borderRadius: '32px',
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
        <Avatar
          src={user?.avatar || ''}
          sx={{ width: '200px', height: '200px' }}
        />
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', mt: 4 }}
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

      <Stack
        spacing={1}
        direction="row"
        sx={{ mb: 4, mt: 1, alignItems: 'center' }}
      >
        <Typography variant="body1">Подписчиков:</Typography>
        {isLoading ? (
          <Skeleton
            variant="rounded"
            width="50px"
            height={24}
          />
        ) : (
          <Typography variant="body1">{user?.followers || 0}</Typography>
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
    </Box>
  );
};
