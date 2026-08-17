import { HideImageOutlined, } from '@mui/icons-material';
import {
  Backdrop,
  Box,
  CircularProgress,
  Stack,
  useMediaQuery,
} from '@mui/material';
import { useState, type SyntheticEvent } from 'react';
import { Navigate, useSearchParams } from 'react-router';

import { useGetUserByIdQuery, USER_ROLE, getUserName } from '@/entities';
import { useAuthStore, CurrentUser } from '@/features';
import { ROUTES } from '@/shared/config/routes';
import { PageFooter, SideBarButton } from '@/widgets';

import { MEDIA_TAB_VALUES } from '../model/types';

import { Content } from './Content';
import { ProfileControl } from './ProfileControl';
import { UserCard } from './UserCard';

export const ProfilePage = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('userId');

  const [mediaTabValue, setMediaTabValue] = useState(MEDIA_TAB_VALUES.ACTIVE);
  const [tabValue, setTabValue] = useState(0);

  const { id: userId, role } = useAuthStore();
  const profileUserId = id || userId;
  const isOwnProfile = !id || id === userId;
  const isManager = role === USER_ROLE.MANAGER;

  const { data: user, isLoading } = useGetUserByIdQuery(
    isManager && isOwnProfile ? null : profileUserId
  );
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  if (isManager && isOwnProfile) {
    return (
      <Navigate
        to={ROUTES.SETTINGS_ACCOUNT}
        replace
      />
    );
  }

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Stack
      direction="column"
      sx={{
        height: '100%',
        position: 'relative',
        backgroundColor: 'secondary.light',
      }}
    >
      <Box
        sx={{
          width: '100%',
          position: 'relative',
          border: '1px solid',
          borderColor: 'divider',
          backgroundSize: 'cover',
          height: { xs: 250, md: 300 },
          backgroundPosition: 'center ',
          backgroundRepeat: 'no-repeat',
          minHeight: { xs: 250, md: 300 },
          borderTopLeftRadius: { xs: 0, md: '24px' },
          backgroundColor: 'rgba(212, 212, 212, 0.5)',
          borderBottomLeftRadius: { xs: 0, md: '24px' },
          backgroundImage: `url(${user?.data?.banner})`,
        }}
      >
        {!user?.data?.banner &&
          <HideImageOutlined
            color='info'
            fontSize='large'
            sx={{
              top: '50%',
              right: '50%',
              position: 'absolute',
              transform: 'translate(50%, -50%)'
            }}
          />
        }

        <Stack
          direction="row"
          sx={{
            width: '100%',
            p: { xs: 2, md: 4 },
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
          mb: 1,
          mt: -7,
          flex: 1,
          width: '100%',
          pt: { xs: 0, md: 4 },
          px: { xs: 0, md: 2 },
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 1 }}
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
            spacing={1}
            direction="column"
            sx={{
              width: '100%',
              height: '100%',
            }}
          >
            <ProfileControl
              id={id || ''}
              tabValue={tabValue}
              mediaTabValue={mediaTabValue}
              handleTabChange={handleTabChange}
              setMediaTabValue={setMediaTabValue}
              shareTitle={getUserName(user?.data) || 'Профиль'}
              isCompany={user?.data?.role === USER_ROLE.COMPANY}
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

      <PageFooter />

      <Backdrop
        open={isLoading}
        sx={{ zIndex: 1000 }}
      >
        <CircularProgress />
      </Backdrop>
    </Stack>
  );
};

export default ProfilePage;
