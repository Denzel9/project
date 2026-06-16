import { MenuItem, Stack, TextField, useMediaQuery } from '@mui/material';

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
  onRoleChange,
  status,
  onStatusChange,
}: MyTaskFilterProps) => {
  const { isScrolled, ref } = useScroll(150);
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  return (
    <Stack
      ref={ref}
      direction="row"
      spacing={2}
      sx={{
        px: 2,
        pb: 2,
        width: '100%',
        transition: 'all 0.3s ease',
        bgcolor: isScrolled ? 'white' : 'transparent',
        borderBottomLeftRadius: isScrolled ? '32px' : '0',
        borderBottomRightRadius: isScrolled ? '32px' : '0',
        boxShadow: isScrolled ? '0 0 10px 0 rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      <TextField
        select
        label="Роль"
        value={role}
        size={isMobile ? 'small' : 'medium'}
        sx={{ width: { xs: '48%', md: '20%' } }}
        onChange={e => onRoleChange(e.target.value as TaskRoleFilter)}
      >
        <MenuItem value="all">Все</MenuItem>
        <MenuItem value="owner">{TASK_ROLE_LABELS.owner}</MenuItem>
        <MenuItem value="executor">{TASK_ROLE_LABELS.executor}</MenuItem>
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
  );
};
