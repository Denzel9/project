import {
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { NavLink } from 'react-router';

import { useAuthStore } from '@/features';

import { CRM_MENU_ITEMS } from '../model/routes/routes';
import { getIsVisibleRoute } from '../model/utils';

import { sidebarSubmenuIconSx } from './sidebarItemStyles';

import type { SidebarCounters } from '../model/useSidebarCounters';
import type { USER_ROLE } from '@/entities';

type CRMNavSectionsProps = {
  pathname: string;
  onItemClick?: () => void;
  variant?: 'sidebar' | 'drawer' | 'popover';
  badges?: SidebarCounters;
};

const isCrmItemActive = (pathname: string, itemPath: string) =>
  pathname === itemPath;

export const CRMNavSections = ({
  pathname,
  onItemClick,
  variant = 'drawer',
  badges,
}: CRMNavSectionsProps) => {
  const { isAuth, role } = useAuthStore();
  const isDrawer = variant === 'drawer';
  const isPopover = variant === 'popover';

  return (
    <List disablePadding>
      {CRM_MENU_ITEMS.map(item => {
        if (!getIsVisibleRoute(item, isAuth, role as USER_ROLE)) return null;

        const isActive = isCrmItemActive(pathname, item.path);
        const badge =
          item.badgeKey && badges ? badges[item.badgeKey] : 0;

        return (
          <ListItemButton
            key={`${item.path}-${item.label}`}
            component={NavLink}
            to={item.path}
            onClick={onItemClick}
            sx={{
              color: 'info.main',
              textDecoration: 'none',
              mb: isPopover ? 0 : 0.5,
              px: isDrawer ? '24px' : 2,
              borderRadius: isDrawer || isPopover ? 0 : '12px',
              bgcolor: isActive ? 'secondary.light' : 'transparent',
              '&:hover': {
                bgcolor: isActive ? 'secondary.light' : 'secondary.main',
              },
            }}
          >
            <ListItemIcon sx={sidebarSubmenuIconSx}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={
                <Box
                  component="span"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {item.label}
                  {badge > 0 && (
                    <Badge
                      badgeContent={badge}
                      color="primary"
                      max={99}
                      sx={{
                        '& .MuiBadge-badge': {
                          position: 'relative',
                          transform: 'none',
                        },
                      }}
                    />
                  )}
                </Box>
              }
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
