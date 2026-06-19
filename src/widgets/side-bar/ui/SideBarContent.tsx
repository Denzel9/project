import { Cyclone, WorkspacesOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router';

import { useAuthStore } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

import {
  AUTH_TYPES,
  TOP_MENU_ROUTES,
  BOTTOM_MENU_ROUTES,
  MENU_ROUTES_PRIME,
} from '../model/routes/routes';

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
  const { isAuth } = useAuthStore();
  const navigate = useNavigate();
  const pathname = useLocation()?.pathname;

  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: { xs: 'auto', md: '100%' },
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

      {isExpanded ? (
        <Box
          sx={{
            p: 2,
            mx: 2,
            borderRadius: '32px',
            mt: { xs: 4, md: 0 },
            bgcolor: 'secondary.light',
          }}
        >
          <Typography variant="body1">Prime-аккаунт</Typography>

          <Typography
            variant="body2"
            sx={{ mt: 1 }}
          >
            Получите доступ к более мощным функциям и возможностям.
          </Typography>

          <Box
            sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <Button
              size="small"
              color="primary"
              sx={{ mt: 2 }}
            >
              Оформить
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton>
            <WorkspacesOutlined />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};
