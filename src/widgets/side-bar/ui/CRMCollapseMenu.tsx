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
import {
  getSidebarItemButtonSx,
  getSidebarItemIconSx,
  getSidebarItemTextSx,
} from './sidebarItemStyles';

import type { SidebarCounters } from '../model/useSidebarCounters';

type CRMCollapseMenuProps = {
  pathname: string;
  isSidebarExpanded: boolean;
  onNavigate?: () => void;
  badges?: SidebarCounters;
};

export const CRMCollapseMenu = ({
  pathname,
  isSidebarExpanded,
  onNavigate,
  badges,
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
    if (!isSidebarExpanded) return;

    setIsOpen(prev => !prev);
  };

  const handleCollapsedClick = (event: MouseEvent<HTMLElement>) => {
    if (isSidebarExpanded) return;

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

  return (
    <Box>
      <ListItemButton
        onClick={isSidebarExpanded ? handleToggle : handleCollapsedClick}
        sx={{
          ...getSidebarItemButtonSx(isSidebarExpanded),
          position: 'relative',
          ...activeIndicatorSx,
        }}
      >
        <ListItemIcon
          sx={{
            ...getSidebarItemIconSx(isSidebarExpanded),
            color: isCrmActive ? 'primary.main' : 'info.main',
          }}
        >
          <DashboardOutlined />
        </ListItemIcon>

        <ListItemText
          primary="CRM"
          sx={{
            ...getSidebarItemTextSx(isSidebarExpanded),
            color: isCrmActive ? 'primary.main' : 'info.main',
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexShrink: 0,
            overflow: 'hidden',
            ml: isSidebarExpanded ? 'auto' : 0,
            opacity: isSidebarExpanded ? 1 : 0,
            flex: isSidebarExpanded ? '0 0 auto' : '0 0 0',
            width: isSidebarExpanded ? 'auto' : 0,
            transition: 'opacity 0.3s ease, width 0.3s ease',
            pointerEvents: isSidebarExpanded ? 'auto' : 'none',
          }}
        >
          {isOpen ? (
            <ExpandLess sx={{ color: 'info.main' }} />
          ) : (
            <ExpandMore sx={{ color: 'info.main' }} />
          )}
        </Box>
      </ListItemButton>

      <Collapse
        in={isSidebarExpanded && isOpen}
        timeout="auto"
        unmountOnExit
      >
        <CRMNavSections
          pathname={pathname}
          variant="drawer"
          onItemClick={onNavigate}
          badges={badges}
        />
      </Collapse>

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
          badges={badges}
        />
      </Popover>
    </Box>
  );
};
