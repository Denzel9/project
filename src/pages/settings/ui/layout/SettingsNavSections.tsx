import { LogoutOutlined } from '@mui/icons-material';
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router';

import { USER_ROLE } from '@/entities';
import { useAuthStore, useLogoutMutation } from '@/features/auth';
import { ROUTES } from '@/shared/config/routes';

import { SETTINGS_MENU_SECTIONS } from '../../model/constants';

type SettingsNavSectionsProps = {
  pathname: string;
  onItemClick?: () => void;
  variant?: 'sidebar' | 'drawer';
};

export const SettingsNavSections = ({
  pathname,
  onItemClick,
  variant = 'sidebar',
}: SettingsNavSectionsProps) => {
  const isDrawer = variant === 'drawer';
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogoutMutation();
  const isPrime = useAuthStore(state => state.isPrime);
  const role = useAuthStore(state => state.role);
  const isManager = role === USER_ROLE.MANAGER;

  const sections = useMemo(() => {
    let next = SETTINGS_MENU_SECTIONS;

    if (!isPrime) {
      next = next.filter(section => section.title !== 'CRM');
    }

    return next
      .map(section => ({
        ...section,
        items: section.items.filter(item => {
          if (item.path === ROUTES.SETTINGS_PROFILES && !isManager) {
            return false;
          }
          if (
            isManager &&
            (item.path === ROUTES.SETTINGS_MEMBERS ||
              item.path === ROUTES.SETTINGS_BILLING)
          ) {
            return false;
          }
          return true;
        }),
      }))
      .filter(section => section.items.length > 0);
  }, [isPrime, isManager]);

  const handleLogout = async () => {
    onItemClick?.();
    await logout();
    navigate(ROUTES.AUTH);
  };

  return (
    <>
      {sections.map(section => (
        <Box
          key={section.title}
          sx={{ mb: isDrawer ? 2 : 3, mt: isDrawer ? 2 : 0 }}
        >
          <Typography
            variant="caption"
            sx={{
              px: isDrawer ? 4 : 2,
              mb: 1,
              display: 'block',
              letterSpacing: '0.08em',
              color: 'text.secondary',
            }}
          >
            {section.title}
          </Typography>

          <List disablePadding>
            {section.items.map(item => {
              const isActive = pathname === item.path;

              return (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  onClick={onItemClick}
                  sx={{
                    mb: 0.5,
                    borderRadius: isDrawer ? 0 : '12px',
                    pl: isDrawer ? 5 : 2,
                    color: 'text.primary',
                    textDecoration: 'none',
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
                        sx: { fontSize: 14, fontWeight: isActive ? 600 : 400 },
                      },
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      ))}

      <Divider sx={{ mb: 3 }} />

      <List
        disablePadding
        sx={{ mt: isDrawer ? 1 : 0 }}
      >
        <ListItemButton
          onClick={handleLogout}
          sx={{
            mb: 0.5,
            borderRadius: isDrawer ? 0 : '12px',
            pl: isDrawer ? 5 : 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'secondary.main',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Выход"
            slotProps={{
              primary: {
                sx: { fontSize: 14 },
              },
            }}
          />
        </ListItemButton>
      </List>
    </>
  );
};
