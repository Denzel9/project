import { FilterListOutlined } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';

import { TASK_ACTIVITY_LABELS, TaskActivityType } from '@/entities/task';

type ActivityFilterChipsProps = {
  activityType?: TaskActivityType;
  onChange: (type?: TaskActivityType) => void;
};

const getMenuItemSx = (isActive: boolean) => ({
  transition: 'all 0.3s ease',
  color: isActive ? 'white' : 'text.primary',
  bgcolor: isActive ? 'primary.light' : 'transparent',
  ':hover': {
    bgcolor: isActive ? 'primary.main' : 'transparent',
  },
});

export const ActivityFilterChips = ({
  activityType,
  onChange,
}: ActivityFilterChipsProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeActivityType =
    (type: TaskActivityType | undefined) => () => {
      if (type === activityType) {
        onChange(undefined);
      } else {
        onChange(type);
      }
      handleClose();
    };

  return (
    <>
      <IconButton onClick={handleClick}>
        <FilterListOutlined />
      </IconButton>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <MenuItem
          sx={getMenuItemSx(activityType === undefined)}
          onClick={handleChangeActivityType(undefined)}
        >
          <Typography>Все</Typography>
        </MenuItem>

        {Object.entries(TASK_ACTIVITY_LABELS).map(([key, label]) => (
          <MenuItem
            key={key}
            sx={getMenuItemSx(activityType === key)}
            onClick={handleChangeActivityType(key as TaskActivityType)}
          >
            <Typography>{label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
