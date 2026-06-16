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

import { MenuItem } from './MenuItem';
import { SettingsCollapseMenu } from './SettingsCollapseMenu';

type SideBarContentProps = {
  isExpanded: boolean;
  onNavigate?: () => void;
};

export const SideBarContent = ({
  isExpanded,
  onNavigate,
}: SideBarContentProps) => {
  const { mutateAsync: logout } = useLogoutMutation();
  const { removeAuth, isAuth } = useAuthStore();
  const navigate = useNavigate();
  const pathname = useLocation()?.pathname;

  const handleLogout = async () => {
    await logout();
    removeAuth();
    onNavigate?.();
    navigate(ROUTES.AUTH);
  };

  return (
    <Box
      sx={{
        py: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <List sx={{ gap: 1, display: 'flex', flexDirection: 'column' }}>
        {isExpanded ? (
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
              isOpenSideBar={isExpanded}
              onNavigate={onNavigate}
            />
          );
        })}

        {isAuth && <Divider sx={{ mt: 2 }} />}

        {isAuth &&
          MENU_ROUTES_PRIME.map(route => (
            <MenuItem
              route={route}
              key={route.path}
              pathname={pathname}
              navigate={navigate}
              isOpenSideBar={isExpanded}
              onNavigate={onNavigate}
            />
          ))}

        {isAuth && <Divider sx={{ mb: 2 }} />}

        {BOTTOM_MENU_ROUTES.map(route => {
          if (route.authType === AUTH_TYPES.ONLY_AUTH && !isAuth) return null;

          if (route.path === ROUTES.SETTINGS && onNavigate) {
            return (
              <SettingsCollapseMenu
                key={route.path}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            );
          }

          return (
            <MenuItem
              route={route}
              key={route.path}
              pathname={pathname}
              navigate={navigate}
              isOpenSideBar={isExpanded}
              onNavigate={onNavigate}
            />
          );
        })}
      </List>

      <Box
        sx={{ bgcolor: 'secondary.light', borderRadius: '32px', p: 2, mx: 2 }}
      >
        <Typography variant="body1">Оформить Prime аккаунт</Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1 }}
        >
          Получите доступ к более мощным функциям и возможностям.
        </Typography>
        <Button
          size="small"
          color="primary"
          sx={{ mt: 2 }}
        >
          Оформить
        </Button>
      </Box>

      {isExpanded ? (
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
