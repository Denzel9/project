import { MoreVert } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem } from '@mui/material';
import { useState, type MouseEvent } from 'react';

type MenuButtonProps = {
  options: string[];
  onAction: (action: string) => void;
};

const MenuButton = ({ options, onAction }: MenuButtonProps) => {
  const [isOpen, setIsOpen] = useState<null | HTMLElement>(null);

  const open = Boolean(isOpen);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setIsOpen(event.currentTarget);
  };

  const handleClose = () => {
    setIsOpen(null);
  };

  const handleAction = (action: string, e: MouseEvent<HTMLLIElement>) => {
    e.stopPropagation();
    onAction(action);
  };

  return (
    <Box>
      <IconButton onClick={handleClick}>
        <MoreVert />
      </IconButton>

      <Menu
        open={open}
        anchorEl={isOpen}
        onClose={handleClose}
      >
        {options.map(option => (
          <MenuItem
            key={option}
            onClick={e => handleAction(option, e)}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default MenuButton;
