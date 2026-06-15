import { ExpandLess, ExpandMore, SettingsOutlined } from '@mui/icons-material';
import {
  Box,
  Collapse,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { SettingsNavSections } from '@/pages/settings/ui/layout/SettingsNavSections';
import { ROUTES } from '@/shared/config/routes';

type SettingsCollapseMenuProps = {
  pathname: string;
  onNavigate?: () => void;
};

export const SettingsCollapseMenu = ({
  pathname,
  onNavigate,
}: SettingsCollapseMenuProps) => {
  const isSettingsActive = pathname.startsWith(ROUTES.SETTINGS);
  const [isOpen, setIsOpen] = useState(isSettingsActive);

  useEffect(() => {
    if (isSettingsActive) {
      setTimeout(() => {
        setIsOpen(true);
      }, 0);
    }
  }, [isSettingsActive]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <Box>
      <ListItemButton
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: '32px !important',
          position: 'relative',
          ':after': {
            content: isSettingsActive ? '""' : 'none',
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
            minWidth: 40,
            color: isSettingsActive ? 'primary.main' : 'secondary.dark',
            svg: { width: 24, height: 24 },
          }}
        >
          <SettingsOutlined />
        </ListItemIcon>

        <ListItemText
          primary="Настройки"
          sx={{
            color: isSettingsActive ? 'primary.main' : 'secondary.dark',
          }}
        />

        {isOpen ? (
          <ExpandLess sx={{ color: 'secondary.dark' }} />
        ) : (
          <ExpandMore sx={{ color: 'secondary.dark' }} />
        )}
      </ListItemButton>

      <Collapse
        in={isOpen}
        timeout="auto"
        unmountOnExit
      >
        <SettingsNavSections
          pathname={pathname}
          variant="drawer"
          onItemClick={onNavigate}
        />
      </Collapse>
    </Box>
  );
};
