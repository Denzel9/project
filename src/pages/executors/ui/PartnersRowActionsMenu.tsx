import { MoreVert } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useState, type MouseEvent } from 'react';

import { ROUTES } from '@/shared';

type PartnersRowActionsMenuProps = {
  userId: string;
};

export const PartnersRowActionsMenu = ({
  userId,
}: PartnersRowActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const stopRowClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    stopRowClick(event);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleWrite = (event: MouseEvent) => {
    stopRowClick(event);
    handleClose();
    window.open(
      `${ROUTES.CHATS}?recipientId=${encodeURIComponent(userId)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <>
      <IconButton
        size="small"
        className="partners-no-print"
        aria-label="Действия"
        onClick={handleOpen}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={stopRowClick}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleWrite}>Написать</MenuItem>
      </Menu>
    </>
  );
};
