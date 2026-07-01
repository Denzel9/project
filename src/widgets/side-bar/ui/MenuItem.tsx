import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: '32px !important',
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
      <ListItemIcon
        sx={{
          minWidth: isOpenSideBar ? 40 : 0,
          color: 'info.main',

          svg: {
            width: isOpenSideBar ? 24 : 28,
            height: isOpenSideBar ? 24 : 28,
          },
        }}
      >
        {route.icon}
      </ListItemIcon>

      {isOpenSideBar && (
        <ListItemText
          primary={route.label}
          sx={{
            color: 'info.main',
          }}
        />
      )}
    </ListItemButton>
  );
};
