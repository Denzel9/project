import { WorkspacesOutlined } from '@mui/icons-material';
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

import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';

import logoSmall from '../../../../public/Mark.png';
import logo from '../../../../public/Primary.png';
import { TOP_MENU_ROUTES, BOTTOM_MENU_ROUTES } from '../model/routes/routes';
import { useSideBarStore } from '../model/store/store';
import { useSidebarCounters } from '../model/useSidebarCounters';
import { getIsVisibleRoute } from '../model/utils';

import { CRMCollapseMenu } from './CRMCollapseMenu';
import { MenuItem } from './MenuItem';
import { SettingsCollapseMenu } from './SettingsCollapseMenu';

import { USER_ROLE } from '@/entities';

type SideBarContentProps = {
  isExpanded?: boolean;
  onNavigate?: () => void;
};

export const SideBarContent = ({
  isExpanded,
  onNavigate,
}: SideBarContentProps = {}) => {
  const { isOpenSideBar } = useSideBarStore();

  const { isAuth, role, isPrime } = useAuthStore();
  const badges = useSidebarCounters();
  const isManager = role === USER_ROLE.MANAGER;
  const showPrimePromo = !isManager && !isPrime;
  const showPrimeActive = !isManager && isPrime;

  const isSidebarExpanded = isExpanded ?? isOpenSideBar;

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const navigate = useNavigate();

  const { pathname } = useLocation();

  return (
    <Box
      sx={{
        height: { xs: 'auto', md: '100%' },
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        pt: 4,
        pb: 3,
      }}
    >
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
        }}
      >
        <List
          disablePadding
          sx={{
            gap: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            pb: 2,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              pb: 4,
              px: isSidebarExpanded ? 4 : 2,
              minHeight: 40,
              overflow: 'hidden',
              transition: 'padding 0.3s ease',
            }}
          >
            <img
              src={isSidebarExpanded ? logo : logoSmall}
              alt="NIKSSENS"
              width="100%"
              height={isSidebarExpanded ? 50 : 36}
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
                badge={route.badgeKey ? badges[route.badgeKey] : 0}
              />
            );
          })}

          {isAuth && showPrimeActive && (
            <>
              <Divider sx={{ mt: 2 }} />

              <CRMCollapseMenu
                pathname={pathname}
                isSidebarExpanded={isSidebarExpanded}
                onNavigate={onNavigate}
                badges={badges}
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
      </Box>

      <Box
        sx={{
          position: 'relative',
          flexShrink: 0,
          minHeight: 48,
          pt: 1,
        }}
      >
        {showPrimePromo && (
          <Box
            sx={{
              p: 2,
              mx: 2,
              borderRadius: '24px',
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
                onClick={() => {
                  navigate(ROUTES.SETTINGS_BILLING);
                  onNavigate?.();
                }}
              >
                Оформить
              </Button>
            </Box>
          </Box>
        )}

        {showPrimeActive && isSidebarExpanded && (
          <Box
            sx={{
              p: 2,
              mx: 2,
              borderRadius: '24px',
              bgcolor: 'secondary.light',
            }}
          >
            <Typography variant="body1">Prime активен</Typography>
            <Typography
              variant="body2"
              sx={{ mt: 1 }}
            >
              Доступны CRM и расширенные функции рабочего пространства.
            </Typography>
          </Box>
        )}

        {!isManager && (
          <Box
            sx={{
              inset: 0,
              display: 'flex',
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isSidebarExpanded || isPrime ? 0 : 1,
              transition: 'opacity 0.3s ease',
              pointerEvents: isSidebarExpanded || isPrime ? 'none' : 'auto',
            }}
          >
            <IconButton
              onClick={() => {
                navigate(ROUTES.SETTINGS_BILLING);
                onNavigate?.();
              }}
            >
              <WorkspacesOutlined />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
};
