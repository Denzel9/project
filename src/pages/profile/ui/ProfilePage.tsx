import {
  Backdrop,
  Box,
  CircularProgress,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { useState, type SyntheticEvent } from 'react';
import { useSearchParams } from 'react-router';

import { useGetUserByIdQuery } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { CurrentUser } from '@/features/current-user';
import { SideBarButton } from '@/widgets/side-bar/ui/SideBarButton';

import { MEDIA_TAB_VALUES } from '../model/types';

import { Content } from './Content';
import { ProfileControl } from './ProfileControl';
import { UserCard } from './UserCard';

export const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('userId');

  const [mediaTabValue, setMediaTabValue] = useState(MEDIA_TAB_VALUES.ACTIVE);
  const [tabValue, setTabValue] = useState(0);

  const { id: userId } = useAuthStore();
  const { data: user, isLoading } = useGetUserByIdQuery(id || userId);

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box
      sx={{
        bgcolor: 'white',
        position: 'relative',
        borderTopLeftRadius: '32px',
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        backgroundColor: 'secondary.light',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '300px',
          position: 'relative',
          backgroundSize: 'cover',
          bgcolor: 'secondary.main',
          backgroundPosition: 'center ',
          backgroundRepeat: 'no-repeat',
          borderTopLeftRadius: { xs: 0, md: '32px' },
          borderBottomLeftRadius: { xs: 0, md: '32px' },
          backgroundImage: `url(${user?.data?.banner})`,
        }}
      >
        <Stack
          spacing={2}
          direction="row"
          sx={{
            width: '100%',
            padding: 4,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <SideBarButton />

          <CurrentUser isButton={isMobile} />
        </Stack>
      </Box>

      <Stack
        direction="row"
        sx={{
          mt: -7,
          width: '100%',
          py: { xs: 0, md: 4 },
          px: { xs: 0, md: 2 },
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            width: '100%',
            height: '100%',
            alignItems: 'start',
            justifyContent: 'space-between',
          }}
        >
          <UserCard
            user={user?.data}
            isLoading={isLoading}
          />

          <Stack
            spacing={2}
            direction="column"
            sx={{
              width: '100%',
            }}
          >
            <ProfileControl
              id={id || ''}
              tabValue={tabValue}
              mediaTabValue={mediaTabValue}
              handleTabChange={handleTabChange}
              setMediaTabValue={setMediaTabValue}
            />

            <Content
              user={user?.data}
              tabValue={tabValue}
              isLoading={isLoading}
              mediaTabValue={mediaTabValue}
            />
          </Stack>
        </Stack>
      </Stack>

      <Backdrop
        open={isLoading}
        sx={{ zIndex: 1000 }}
      >
        <CircularProgress />
      </Backdrop>
    </Box>
  );
};

export default ProfilePage;
