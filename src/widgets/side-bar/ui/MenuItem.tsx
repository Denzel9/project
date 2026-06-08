import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

import type { MenuRoute } from '../model/types';

type MenuItemProps = {
  route: MenuRoute;
  isOpenSideBar: boolean;
  pathname: string;
  navigate: (path: string) => void;
};

export const MenuItem = ({
  route,
  isOpenSideBar,
  pathname,
  navigate,
}: MenuItemProps) => {
  return (
    <ListItemButton
      key={route.path}
      onClick={() => navigate(route.path)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: '32px !important',
        ':after': {
          content: pathname === route.path ? '""' : 'none',
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
          color: pathname === route.path ? 'primary.main' : 'secondary.dark',

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
            color: pathname === route.path ? 'primary.main' : 'secondary.dark',
          }}
        />
      )}
    </ListItemButton>
  );
};
