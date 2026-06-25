import { ArrowForward } from '@mui/icons-material';
import { Box, Chip, Stack } from '@mui/material';

import {
  getTaskStatusColor,
  TASK_STATUS_LABELS,
  type TaskStatus,
} from '@/entities/task';

type ActivityStatusChangeViewProps = {
  from: string;
  to: string;
};

const getStatusKeyByLabel = (label: string): TaskStatus | undefined =>
  (Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).find(
    key => TASK_STATUS_LABELS[key] === label
  );

export const ActivityStatusChangeView = ({
  from,
  to,
}: ActivityStatusChangeViewProps) => {
  const fromKey = getStatusKeyByLabel(from);
  const toKey = getStatusKeyByLabel(to);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: 'center', mt: 2 }}
    >
      <Box
        sx={{
          flex: 1,
          width: '100%',
          p: 2,
          borderRadius: '16px',
          bgcolor: 'secondary.light',
        }}
      >
        <Chip
          size="small"
          label="Было"
          color="error"
          sx={{ mb: 1.5, display: 'flex', width: 'fit-content' }}
        />
        <Chip
          label={from}
          color={fromKey ? getTaskStatusColor(fromKey) : 'default'}
        />
      </Box>

      <ArrowForward color="action" />

      <Box
        sx={{
          flex: 1,
          width: '100%',
          p: 2,
          borderRadius: '16px',
          bgcolor: 'secondary.light',
        }}
      >
        <Chip
          size="small"
          label="Стало"
          color="success"
          sx={{ mb: 1.5, display: 'flex', width: 'fit-content' }}
        />
        <Chip
          label={to}
          color={toKey ? getTaskStatusColor(toKey) : 'default'}
        />
      </Box>
    </Stack>
  );
};
