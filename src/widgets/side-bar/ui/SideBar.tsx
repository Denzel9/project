import { Box } from '@mui/material';

import { useSideBarStore } from '../model/store/store';

import { SideBarContent } from './SideBarContent';

export const SideBar = () => {
  const { isOpenSideBar } = useSideBarStore();

  return (
    <Box
      sx={{
        top: 0,
        minHeight: 0,
        flexShrink: 0,
        height: '100vh',
        bgcolor: 'white',
        position: 'sticky',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        flexDirection: 'column',
        borderTopRightRadius: 32,
        borderBottomRightRadius: 32,
        transition: 'width 0.3s ease',
        width: isOpenSideBar ? 280 : 70,
        display: { xs: 'none', md: 'flex' },
      }}
    >
      <SideBarContent />
    </Box>
  );
};

export default SideBar;
