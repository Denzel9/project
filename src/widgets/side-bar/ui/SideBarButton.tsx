import { SwitchRight, SwitchLeft } from '@mui/icons-material';
import { IconButton } from '@mui/material';

import { useSideBarStore } from '../model/store';

export const SideBarButton = () => {
  const { isOpenSideBar, setIsOpenSideBar } = useSideBarStore();

  return (
    <IconButton
      size="large"
      color="primary"
      onClick={() => setIsOpenSideBar(!isOpenSideBar)}
    >
      {isOpenSideBar ? <SwitchRight /> : <SwitchLeft />}
    </IconButton>
  );
};
