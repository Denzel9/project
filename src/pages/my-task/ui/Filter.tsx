import { CalendarMonthOutlined, Search } from '@mui/icons-material';
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  Popover,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from 'dayjs';
import { useState } from 'react';

import { TASK_ROLE_LABELS, TASK_STATUS_LABELS } from '@/entities/task';
import { useScroll } from '@/shared/hooks/useScroll';

import type { TaskRoleFilter, TaskStatusFilter } from '../model/utils';

type MyTaskFilterProps = {
  role: TaskRoleFilter;
  onRoleChange: (value: TaskRoleFilter) => void;
  status: TaskStatusFilter;
  onStatusChange: (value: TaskStatusFilter) => void;
};

export const MyTaskFilter = ({
  role,
  status,
  onRoleChange,
  onStatusChange,
}: MyTaskFilterProps) => {
  const { isScrolled, ref } = useScroll(150);

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const [updatedDate, setUpdatedDate] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleDateChange = (date: Dayjs | null) => {
    setUpdatedDate(date ? date.format('YYYY-MM-DD') : null);
    setAnchorEl(null);
  };

  const handleClearDate = () => {
    setUpdatedDate(null);
    setAnchorEl(null);
  };
  return (
    <Stack
      ref={ref}
      direction="row"
      spacing={2}
      sx={{
        px: 2,
        pb: 2,
        width: '100%',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        justifyContent: 'space-between',
        bgcolor: isScrolled ? 'white' : 'transparent',
        borderBottomLeftRadius: isScrolled ? '32px' : '0',
        borderBottomRightRadius: isScrolled ? '32px' : '0',
        boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{ width: '100%' }}
      >
        <TextField
          select
          label={
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', width: 'fit-content' }}
            >
              <Typography variant="body1">Моя роль </Typography>
              <Chip label={'1'} />
            </Stack>
          }
          value={role}
          size={isMobile ? 'small' : 'medium'}
          sx={{ width: { xs: '48%', md: '20%' } }}
          onChange={e => onRoleChange(e.target.value as TaskRoleFilter)}
        >
          <MenuItem value="all">Все</MenuItem>
          <MenuItem value="owner">{TASK_ROLE_LABELS.owner} 1</MenuItem>
          <MenuItem value="executor">{TASK_ROLE_LABELS.executor} 12</MenuItem>
        </TextField>

        <TextField
          select
          label="Статус"
          value={status}
          size={isMobile ? 'small' : 'medium'}
          sx={{ width: { xs: '48%', md: '20%' } }}
          onChange={e => onStatusChange(e.target.value as TaskStatusFilter)}
        >
          <MenuItem value="all">Все</MenuItem>
          {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
            <MenuItem
              key={value}
              value={value}
            >
              {label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Stack direction="row">
        <IconButton
          color={updatedDate ? 'primary' : 'default'}
          onClick={event => setAnchorEl(event.currentTarget)}
        >
          <CalendarMonthOutlined />
        </IconButton>

        <IconButton onClick={() => {}}>
          <Search />
        </IconButton>
      </Stack>

      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: '32px',
          },
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <DateCalendar
          value={updatedDate ? dayjs(updatedDate) : null}
          onChange={handleDateChange}
          views={['year', 'month', 'day']}
        />
        {updatedDate && (
          <Button
            fullWidth
            onClick={handleClearDate}
            sx={{ mb: 2, mx: 2, width: 'calc(100% - 32px)' }}
          >
            Все даты
          </Button>
        )}
      </Popover>
    </Stack>
  );
};
