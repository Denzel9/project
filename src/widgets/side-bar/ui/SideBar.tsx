import { Box } from '@mui/material';

import { useSideBarStore } from '../model/store/store';

import { SideBarContent } from './SideBarContent';

export const SideBar = () => {
  const { isOpenSideBar } = useSideBarStore();

  return (
    <Box
      sx={{
        top: 0,
        overflow: 'scroll',
        height: '100vh',
        width: '100%',
        bgcolor: 'white',
        position: 'sticky',
        border: '1px solid',
        scrollbarWidth: 'none',
        borderColor: 'divider',
        flexDirection: 'column',
        borderTopRightRadius: 32,
        transition: 'all 0.3s ease',
        borderBottomRightRadius: 32,
        maxWidth: isOpenSideBar ? 280 : 70,
        display: { xs: 'none', md: 'flex' },
      }}
    >
      <SideBarContent />
    </Box>
  );
};

export default SideBar;
