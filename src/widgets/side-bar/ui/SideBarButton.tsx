import { FirstPage, LastPage, Menu } from '@mui/icons-material';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';

import { useSideBarStore } from '../model/store';

export const SideBarButton = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isOpenSideBar, setIsOpenSideBar, setMobileDrawerOpen } =
    useSideBarStore();

  if (isMobile) {
    return (
      <IconButton
        size="large"
        color="primary"
        onClick={() => setMobileDrawerOpen(true)}
      >
        <Menu />
      </IconButton>
    );
  }

  return (
    <IconButton
      size="large"
      color="primary"
      onClick={() => setIsOpenSideBar(!isOpenSideBar)}
    >
      {isOpenSideBar ? <FirstPage /> : <LastPage />}
    </IconButton>
  );
};
