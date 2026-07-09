import { Cyclone, WorkspacesOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router';

import { BASE_COLOR } from '@/app/index';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';

import { TOP_MENU_ROUTES, BOTTOM_MENU_ROUTES } from '../model/routes/routes';
import { useSideBarStore } from '../model/store/store';
import { getIsVisibleRoute } from '../model/utils';

import { CRMCollapseMenu } from './CRMCollapseMenu';
import { MenuItem } from './MenuItem';
import { SettingsCollapseMenu } from './SettingsCollapseMenu';

import type { USER_ROLE } from '@/entities';

type SideBarContentProps = {
  isExpanded?: boolean;
  onNavigate?: () => void;
};

export const SideBarContent = ({
  isExpanded,
  onNavigate,
}: SideBarContentProps = {}) => {
  const { isOpenSideBar } = useSideBarStore();

  const { isAuth, role } = useAuthStore();

  const isSidebarExpanded = isExpanded ?? isOpenSideBar;

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const navigate = useNavigate();

  const { pathname } = useLocation();

  return (
    <Box
      sx={{
        py: 4,
        display: 'flex',
        overflow: 'scroll',
        scrollbarWidth: 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: { xs: 'auto', md: '100%' },
      }}
    >
      <List sx={{ gap: 1, display: 'flex', flexDirection: 'column', mb: 10 }}>
        <Box
          sx={{
            position: 'relative',
            pb: 10,
            px: isSidebarExpanded ? 4 : 2,
            minHeight: 40,
            overflow: 'hidden',
            transition: 'padding 0.3s ease',
          }}
        >
          <Typography
            variant="h4"
            sx={{
              m: 0,
              opacity: isSidebarExpanded ? 1 : 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'opacity 0.3s ease',
              pointerEvents: isSidebarExpanded ? 'auto' : 'none',
            }}
          >
            NIKS<span style={{ color: BASE_COLOR }}>SENS</span>
          </Typography>

          <Cyclone
            color="primary"
            sx={{
              position: 'absolute',
              top: 0,
              left: '50%',
              fontSize: 40,
              opacity: isSidebarExpanded ? 0 : 1,
              transform: 'translateX(-50%)',
              transition: 'opacity 0.3s ease',
              pointerEvents: isSidebarExpanded ? 'none' : 'auto',
            }}
          />
        </Box>

        {TOP_MENU_ROUTES.map(route => {
          if (!getIsVisibleRoute(route, isAuth, role as USER_ROLE)) return null;

          return (
            <MenuItem
              route={route}
              key={route.path}
              pathname={pathname}
              navigate={navigate}
              isOpenSideBar={isSidebarExpanded}
              onNavigate={onNavigate}
            />
          );
        })}

        {isAuth && (
          <>
            <Divider sx={{ mt: 2 }} />

            <CRMCollapseMenu
              pathname={pathname}
              isSidebarExpanded={isSidebarExpanded}
              onNavigate={onNavigate}
            />

            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {BOTTOM_MENU_ROUTES.map(route => {
          if (!getIsVisibleRoute(route, isAuth, role as USER_ROLE)) return null;

          if (route.path === ROUTES.SETTINGS && isMobile) {
            return (
              <SettingsCollapseMenu
                key={route.path}
                pathname={pathname}
              />
            );
          }

          return (
            <MenuItem
              route={route}
              key={route.path}
              pathname={pathname}
              navigate={navigate}
              isOpenSideBar={isSidebarExpanded}
              onNavigate={onNavigate}
            />
          );
        })}
      </List>

      <Box sx={{ position: 'relative', minHeight: 48 }}>
        <Box
          sx={{
            p: 2,
            mx: 2,
            borderRadius: '32px',
            mt: { xs: 4, md: 0 },
            bgcolor: 'secondary.light',
            opacity: isSidebarExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'opacity 0.3s ease',
            pointerEvents: isSidebarExpanded ? 'auto' : 'none',
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

        <Box
          sx={{
            inset: 0,
            display: 'flex',
            position: 'absolute',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isSidebarExpanded ? 0 : 1,
            transition: 'opacity 0.3s ease',
            pointerEvents: isSidebarExpanded ? 'none' : 'auto',
          }}
        >
          <IconButton>
            <WorkspacesOutlined />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
