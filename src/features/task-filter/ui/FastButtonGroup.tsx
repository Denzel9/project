import { Stack, Badge, Chip } from '@mui/material';

import { useMyTaskFilterStore } from '../model/store';

import type { Task } from '@/entities';

type FastButtonGroupProps = {
  activeTasks: Task[];
  rejectedTasks: Task[];
  pendingConfirmationTasks: Task[];
};

export const FastButtonGroup = ({
  activeTasks,
  rejectedTasks,
  pendingConfirmationTasks,
}: FastButtonGroupProps) => {
  const { fastButtonValue, setFastButtonValue } = useMyTaskFilterStore();
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ width: '100%', justifyContent: 'space-between' }}
    >
      <Stack
        direction="row"
        spacing={2}
      >
        <Badge
          badgeContent={activeTasks.length}
          color="info"
        >
          <Chip
            label="Ожидают действия"
            sx={{ cursor: 'pointer' }}
            onClick={() => setFastButtonValue('pending-action')}
            color={fastButtonValue === 'pending-action' ? 'primary' : 'default'}
          />
        </Badge>

        <Badge
          badgeContent={pendingConfirmationTasks.length}
          color="info"
        >
          <Chip
            label="Ожидают назначения"
            color={
              fastButtonValue === 'pending-executor-assign'
                ? 'primary'
                : 'default'
            }
            sx={{ cursor: 'pointer' }}
            onClick={() => setFastButtonValue('pending-executor-assign')}
          />
        </Badge>

        <Badge
          badgeContent={rejectedTasks.length}
          color="info"
        >
          <Chip
            label="Отмененные"
            color={fastButtonValue === 'cancelled' ? 'primary' : 'default'}
            sx={{ cursor: 'pointer' }}
            onClick={() => setFastButtonValue('cancelled')}
          />
        </Badge>
      </Stack>
    </Stack>
  );
};
