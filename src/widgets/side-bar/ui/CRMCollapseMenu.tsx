import { DashboardOutlined, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Collapse,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
} from '@mui/material';
import { useEffect, useState, type MouseEvent } from 'react';

import { ROUTES } from '@/shared/config/routes';

import { CRMNavSections } from './CRMNavSections';

type CRMCollapseMenuProps = {
  pathname: string;
  isSidebarExpanded: boolean;
  onNavigate?: () => void;
};

export const CRMCollapseMenu = ({
  pathname,
  isSidebarExpanded,
  onNavigate,
}: CRMCollapseMenuProps) => {
  const isCrmActive = pathname.startsWith(ROUTES.CRM);
  const [isOpen, setIsOpen] = useState(isCrmActive);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isCrmActive) {
      setTimeout(() => {
        setIsOpen(true);
      }, 0);
    }
  }, [isCrmActive]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleCollapsedClick = (event: MouseEvent<HTMLElement>) => {
    setPopoverAnchor(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
  };

  const handleItemClick = () => {
    onNavigate?.();
    handlePopoverClose();
  };

  const activeIndicatorSx = {
    ':after': {
      content: isCrmActive ? '""' : 'none',
      position: 'absolute',
      right: 0,
      width: '6px',
      height: '100%',
      backgroundColor: 'primary.main',
      borderTopLeftRadius: 32,
      borderBottomLeftRadius: 32,
    },
  } as const;

  if (!isSidebarExpanded) {
    return (
      <Box>
        <ListItemButton
          onClick={handleCollapsedClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: '32px !important',
            position: 'relative',
            ...activeIndicatorSx,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              color: isCrmActive ? 'primary.main' : 'info.main',
              svg: { width: 28, height: 28 },
            }}
          >
            <DashboardOutlined />
          </ListItemIcon>
        </ListItemButton>

        <Popover
          anchorEl={popoverAnchor}
          open={Boolean(popoverAnchor)}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                py: 1,
                minWidth: 220,
                borderRadius: '16px',
              },
            },
          }}
        >
          <CRMNavSections
            pathname={pathname}
            variant="popover"
            onItemClick={handleItemClick}
          />
        </Popover>
      </Box>
    );
  }

  return (
    <Box>
      <ListItemButton
        onClick={handleToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: '32px !important',
          position: 'relative',
          ...activeIndicatorSx,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 40,
            color: 'info.main',
            svg: { width: 24, height: 24 },
          }}
        >
          <DashboardOutlined />
        </ListItemIcon>

        <ListItemText
          primary="CRM"
          sx={{
            color: isCrmActive ? 'primary.main' : 'info.main',
          }}
        />

        {isOpen ? (
          <ExpandLess sx={{ color: 'info.main' }} />
        ) : (
          <ExpandMore sx={{ color: 'info.main' }} />
        )}
      </ListItemButton>

      <Collapse
        in={isOpen}
        timeout="auto"
        unmountOnExit
      >
        <CRMNavSections
          pathname={pathname}
          variant="drawer"
          onItemClick={onNavigate}
        />
      </Collapse>
    </Box>
  );
};
