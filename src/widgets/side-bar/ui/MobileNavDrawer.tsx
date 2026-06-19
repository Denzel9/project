import { Drawer } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { useSideBarStore } from '../model/store/store';

import { SideBarContent } from './SideBarContent';

export const MobileNavDrawer = () => {
  const { isMobileDrawerOpen, setMobileDrawerOpen } = useSideBarStore();
  const { pathname } = useLocation();

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname, setMobileDrawerOpen]);

  const handleClose = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <Drawer
      anchor="left"
      open={isMobileDrawerOpen}
      onClose={handleClose}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          width: 280,
          borderTopRightRadius: 32,
          borderBottomRightRadius: 32,
        },
      }}
    >
      <SideBarContent
        isExpanded
        onNavigate={handleClose}
      />
    </Drawer>
  );
};
