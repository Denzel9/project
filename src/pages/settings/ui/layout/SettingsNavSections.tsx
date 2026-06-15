import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { NavLink } from 'react-router';

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

  return (
    <>
      {SETTINGS_MENU_SECTIONS.map(section => (
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
    </>
  );
};
