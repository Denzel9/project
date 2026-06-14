import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { useState, type SyntheticEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import { useGetUserByIdQuery } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { CurrentUser } from '@/features/current-user';
import { ROUTES } from '@/shared/config/routes';
import { SideBarButton } from '@/widgets/side-bar/ui/SideBarButton';

import { Content } from './Content';
import { UserCard } from './UserCard';

export const ProfilePage = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const id = searchParams.get('userId');

  const { id: userId } = useAuthStore();

  const { data: user, isLoading } = useGetUserByIdQuery(id || userId);

  const [tabValue, setTabValue] = useState(0);

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
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '250px',
          position: 'relative',
          backgroundSize: 'cover',
          borderTopLeftRadius: '32px',
          backgroundPosition: 'center ',
          backgroundRepeat: 'no-repeat',
          backgroundImage: 'url(cosmetic.jpg)',
        }}
      >
        <Stack
          spacing={2}
          direction="row"
          sx={{
            padding: 4,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <SideBarButton />
          <CurrentUser />
        </Stack>
      </Box>

      <Stack
        direction="row"
        sx={{
          p: { xs: 2, md: 4 },
          mt: -10,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            gap: 2,
            width: '100%',
            height: '100%',
            alignItems: 'start',
            justifyContent: 'space-between',
          }}
        >
          <UserCard
            isLoading={isLoading}
            user={user?.data}
          />

          <Stack
            spacing={2}
            direction="column"
            sx={{
              width: '100%',
              minHeight: 'calc(100vh - 250px)',
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: 'center',
                mt: { xs: 6, md: '100px !important' },
                justifyContent: 'space-between',
              }}
            >
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
              >
                <Tab label="Медиа" />
                <Tab label="Обо мне" />
                <Tab label="Контакты" />
              </Tabs>

              {id && id !== userId ? (
                <Button
                  size="small"
                  sx={{ px: 2 }}
                  onClick={() => navigate(`${ROUTES.CHAT}?recipientId=${id}`)}
                >
                  Написать сообщение
                </Button>
              ) : (
                <Button
                  size="small"
                  sx={{ px: 2 }}
                  onClick={() => navigate(ROUTES.SETTINGS_ACCOUNT)}
                >
                  Редактировать
                </Button>
              )}
            </Stack>

            <Content
              isLoading={isLoading}
              tabValue={tabValue}
              user={user?.data}
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
