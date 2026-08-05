import {
  Badge,
  Box,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import {
  getSidebarItemButtonSx,
  getSidebarItemIconSx,
  getSidebarItemTextSx,
} from './sidebarItemStyles';

import type { MenuRoute } from '../model/types/types';

type MenuItemProps = {
  route: MenuRoute;
  isOpenSideBar: boolean;
  pathname: string;
  navigate: (path: string) => void;
  onNavigate?: () => void;
  badge?: number;
};

const SidebarCountBadge = ({ count }: { count: number }) => (
  <Badge
    badgeContent={count}
    color="primary"
    max={99}
    sx={{
      '& .MuiBadge-badge': {
        position: 'relative',
        transform: 'none',
      },
    }}
  />
);

export const MenuItem = ({
  route,
  isOpenSideBar,
  pathname,
  navigate,
  onNavigate,
  badge = 0,
}: MenuItemProps) => {
  const getActivePath = () => {
    if (pathname === '/' && route.path === '/') {
      return '""';
    }
    return pathname.includes(route.path) && route.path !== '/' ? '""' : 'none';
  };

  return (
    <ListItemButton
      key={route.path}
      onClick={() => {
        navigate(route.path);
        onNavigate?.();
      }}
      sx={{
        ...getSidebarItemButtonSx(isOpenSideBar),
        ':after': {
          content: getActivePath(),
          position: 'absolute',
          right: 0,
          width: '6px',
          height: '100%',
          backgroundColor: 'primary.main',
          borderTopLeftRadius: 32,
          borderBottomLeftRadius: 32,
        },
      }}
    >
      <ListItemIcon sx={{ ...getSidebarItemIconSx(isOpenSideBar), color: 'info.main' }}>
        {isOpenSideBar ? (
          route.icon
        ) : (
          <Badge
            badgeContent={badge}
            color="primary"
            max={99}
          >
            {route.icon}
          </Badge>
        )}
      </ListItemIcon>

      <ListItemText
        primary={
          isOpenSideBar ? (
            <Box
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {route.label}
              {badge > 0 && <SidebarCountBadge count={badge} />}
            </Box>
          ) : (
            route.label
          )
        }
        sx={{
          ...getSidebarItemTextSx(isOpenSideBar),
          color: 'info.main',
        }}
      />
    </ListItemButton>
  );
};
