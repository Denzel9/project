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

  // У менеджера нет своей витрины — только просмотр чужих профилей
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
          border: '1px solid',
          position: 'relative',
          borderColor: 'divider',
          backgroundSize: 'cover',
          bgcolor: 'secondary.main',
          height: { xs: 250, md: 300 },
          minHeight: { xs: 250, md: 300 },
          backgroundPosition: 'center ',
          backgroundRepeat: 'no-repeat',
          borderTopLeftRadius: { xs: 0, md: '32px' },
          borderBottomLeftRadius: { xs: 0, md: '32px' },
          backgroundImage: `url(${user?.data?.banner})`,
        }}
      >
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
          px: { xs: 0, md: 1 },
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 4, md: 1 }}
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
              shareTitle={getUserName(user?.data) || 'Профиль'}
              tabValue={tabValue}
              mediaTabValue={mediaTabValue}
              handleTabChange={handleTabChange}
              setMediaTabValue={setMediaTabValue}
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
