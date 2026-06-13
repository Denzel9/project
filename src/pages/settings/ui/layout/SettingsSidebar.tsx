import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router';

import { SETTINGS_MENU_SECTIONS } from '../../model/constants';

export const SettingsSidebar = () => {
  const { pathname } = useLocation();

  return (
    <Box
      sx={{
        p: 4,
        minWidth: 350,
        bgcolor: 'white',
        borderRadius: '32px',
      }}
    >
      {SETTINGS_MENU_SECTIONS.map(section => (
        <Box
          key={section.title}
          sx={{ mb: 3 }}
        >
          <Typography
            variant="caption"
            sx={{
              px: 2,
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
                  sx={{
                    mb: 0.5,
                    borderRadius: '12px',
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
    </Box>
  );
};
