import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

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
};

export const MenuItem = ({
  route,
  isOpenSideBar,
  pathname,
  navigate,
  onNavigate,
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
        {route.icon}
      </ListItemIcon>

      <ListItemText
        primary={route.label}
        sx={{
          ...getSidebarItemTextSx(isOpenSideBar),
          color: 'info.main',
        }}
      />
    </ListItemButton>
  );
};
