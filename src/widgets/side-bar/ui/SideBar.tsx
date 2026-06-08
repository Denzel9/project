import { Cyclone, ExitToApp } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router';

import { useAuthStore, useLogoutMutation } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

import {
  AUTH_TYPES,
  TOP_MENU_ROUTES,
  BOTTOM_MENU_ROUTES,
  MENU_ROUTES_PRIME,
} from '../model/routes';
import { useSideBarStore } from '../model/store';

import { MenuItem } from './MenuItem';

export const SideBar = () => {
  const { isOpenSideBar } = useSideBarStore();

  const { mutateAsync: logout } = useLogoutMutation();

  const { removeAuth, isAuth } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    removeAuth();
    navigate(ROUTES.AUTH);
  };

  const navigate = useNavigate();

  const pathname = useLocation()?.pathname;

  return (
    <Box
      sx={{
        bgcolor: 'white',
        width: '100%',
        transition: 'all 0.3s ease',
        maxWidth: isOpenSideBar ? 280 : 70,
        height: '100vh',
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        py: 4,
      }}
    >
      <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
        {isOpenSideBar ? (
          <Typography
            variant="h6"
            sx={{ pb: 10, px: 4 }}
          >
            LOGO
          </Typography>
        ) : (
          <Cyclone
            sx={{ mb: 10, mx: 2, fontSize: 40 }}
            color="primary"
          />
        )}

        {TOP_MENU_ROUTES.map(route => {
          if (route.authType === AUTH_TYPES.ONLY_AUTH && !isAuth) return null;

          return (
            <MenuItem
              route={route}
              key={route.path}
              pathname={pathname}
              navigate={navigate}
              isOpenSideBar={isOpenSideBar}
            />
          );
        })}

        {isAuth && <Divider sx={{ mt: 2 }} />}

        {isAuth &&
          MENU_ROUTES_PRIME.map(route => {
            return (
              <MenuItem
                route={route}
                key={route.path}
                pathname={pathname}
                navigate={navigate}
                isOpenSideBar={isOpenSideBar}
              />
            );
          })}

        {isAuth && <Divider sx={{ mb: 2 }} />}

        {BOTTOM_MENU_ROUTES.map(route => {
          if (route.authType === AUTH_TYPES.ONLY_AUTH && !isAuth) return null;

          return (
            <MenuItem
              route={route}
              key={route.path}
              pathname={pathname}
              navigate={navigate}
              isOpenSideBar={isOpenSideBar}
            />
          );
        })}
      </List>

      {isOpenSideBar ? (
        <Button
          size="large"
          sx={{ mx: 2 }}
          variant="outlined"
          onClick={handleLogout}
        >
          {isAuth ? 'Выйти' : 'Войти'}
        </Button>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconButton onClick={handleLogout}>
            <ExitToApp sx={{ width: 28, height: 28 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default SideBar;
