import {
  Verified,
  Email,
  Phone,
  LocationOn,
  Upload,
} from '@mui/icons-material';
import {
  Box,
  Avatar,
  Stack,
  Typography,
  IconButton,
  Skeleton,
} from '@mui/material';

import { getUserName } from '@/entities/user';
import { PhoneInput } from '@/shared';

import { useProfileStore } from '../model/store';

import { EditTextField } from './EditTextField';
import { UserCardItem } from './UserCardItem';

export const UserCard = ({ isLoading }: { isLoading: boolean }) => {
  const { isEdit, isMe, user } = useProfileStore();

  return (
    <Box
      sx={{
        p: 4,
        zIndex: 3,
        top: '16px',
        bgcolor: 'white',
        maxWidth: '350px',
        minWidth: '350px',
        position: 'sticky',
        borderRadius: '32px',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={user?.avatar}
            sx={{ width: '200px', height: '200px' }}
          />

          {isMe && isEdit && (
            <IconButton
              sx={{
                bottom: 0,
                right: 20,
                opacity: 1,
                position: 'absolute',
                '&:hover': { opacity: 1 },
                transition: 'all 0.3s ease',
              }}
            >
              <Upload />
            </IconButton>
          )}
        </Box>
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
      ) : (
        <EditTextField
          name="bio"
          isMultiline
          isMe={isMe}
          isEdit={isEdit}
          placeholder="Добавить описание"
        />
      )}

      <Stack
        spacing={2}
        direction="column"
        sx={{ mt: isEdit ? 5 : 4 }}
      >
        <UserCardItem
          isMe={isMe}
          name="email"
          isEdit={isEdit}
          icon={<Email />}
          isLoading={isLoading}
          placeholder="Добавить email"
        />

        <UserCardItem
          isMe={isMe}
          name="phone"
          isEdit={isEdit}
          icon={<Phone />}
          isLoading={isLoading}
          InputField={PhoneInput}
          placeholder="Добавить телефон"
        />

        <UserCardItem
          isMe={isMe}
          name="location"
          isEdit={isEdit}
          isLoading={isLoading}
          icon={<LocationOn />}
          placeholder="Добавить местоположение"
        />
      </Stack>
    </Box>
  );
};
