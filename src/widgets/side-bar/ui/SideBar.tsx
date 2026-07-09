import { Box } from '@mui/material';

import { useSideBarStore } from '../model/store/store';

import { SideBarContent } from './SideBarContent';

export const SideBar = () => {
  const { isOpenSideBar } = useSideBarStore();

  return (
    <Box
      sx={{
        top: 0,
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        overflow: 'hidden',
        bgcolor: 'white',
        border: '1px solid',
        scrollbarWidth: 'none',
        borderColor: 'divider',
        flexDirection: 'column',
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
        width: isOpenSideBar ? 280 : 70,
        transition: 'width 0.3s ease',
        display: { xs: 'none', md: 'flex' },
      }}
    >
      <SideBarContent />
    </Box>
  );
};

export default SideBar;
