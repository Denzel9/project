import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { NavLink } from 'react-router';

import { CRM_MENU_ITEMS } from '../model/routes/routes';

type CRMNavSectionsProps = {
  pathname: string;
  onItemClick?: () => void;
  variant?: 'sidebar' | 'drawer' | 'popover';
};

const isCrmItemActive = (pathname: string, itemPath: string) =>
  pathname === itemPath;

export const CRMNavSections = ({
  pathname,
  onItemClick,
  variant = 'drawer',
}: CRMNavSectionsProps) => {
  const isDrawer = variant === 'drawer';
  const isPopover = variant === 'popover';

  return (
    <List disablePadding>
      {CRM_MENU_ITEMS.map(item => {
        const isActive = isCrmItemActive(pathname, item.path);

        return (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            onClick={onItemClick}
            sx={{
              color: 'info.main',
              textDecoration: 'none',
              mb: isPopover ? 0 : 0.5,
              pl: isDrawer ? 4 : isPopover ? 2 : 2,
              borderRadius: isDrawer || isPopover ? 0 : '12px',
              bgcolor: isActive ? 'secondary.light' : 'transparent',
              '&:hover': {
                bgcolor: isActive ? 'secondary.light' : 'secondary.main',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{
                primary: {
                  sx: { fontSize: 14 },
                },
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
};
