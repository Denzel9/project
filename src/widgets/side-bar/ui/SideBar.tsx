import { Box } from '@mui/material';

import { useSideBarStore } from '../model/store';

import { SideBarContent } from './SideBarContent';

export const SideBar = () => {
  const { isOpenSideBar } = useSideBarStore();

  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        bgcolor: 'white',
        width: '100%',
        transition: 'all 0.3s ease',
        maxWidth: isOpenSideBar ? 280 : 70,
        height: '100vh',
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
        position: 'sticky',
        top: 0,
        flexDirection: 'column',
      }}
    >
      <SideBarContent isExpanded={isOpenSideBar} />
    </Box>
  );
};

export default SideBar;
