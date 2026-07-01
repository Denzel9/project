import { Whatshot } from '@mui/icons-material';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import { getTaskConfig } from '@/features';
import { ROUTES } from '@/shared';

import {
  getEventLabel,
  isTaskOverdue,
  type CalendarEvent,
} from '../model/utils';

type CalendarTaskListItemProps = {
  event: CalendarEvent;
};

export const CalendarTaskListItem = ({ event }: CalendarTaskListItemProps) => {
  const { task, type } = event;
  const taskConfig = getTaskConfig(task.status);
  const accentColor = taskConfig?.color ?? 'primary';
  const title = task.title || task.post?.title || 'Задача';
  const isOverdue = type === 'deadline' && isTaskOverdue(task);

  return (
    <Box
      component={Link}
      to={`${ROUTES.TASK}/${task.post?.id}?inviteId=${task.id}`}
      sx={{
        p: 2,
        display: 'block',
        color: 'inherit',
        bgcolor: 'white',
        borderRadius: '20px',
        textDecoration: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderLeftWidth: 4,
        borderLeftColor: theme => theme.palette[accentColor].main,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        ':hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ flexWrap: 'wrap', gap: 0.75, mb: 1 }}
      >
        <Chip
          size="small"
          variant="outlined"
          label={getEventLabel(type)}
          color={type === 'deadline' ? 'primary' : 'default'}
        />

        <Chip
          size="small"
          label={taskConfig?.label}
          color={accentColor}
        />

        {task.urgent && (
          <Chip
            size="small"
            icon={<Whatshot />}
            label="Срочно"
            color="error"
            variant="outlined"
          />
        )}

        {isOverdue && (
          <Chip
            size="small"
            label="Просрочено"
            color="error"
          />
        )}
      </Stack>

      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600 }}
      >
        {title}
      </Typography>
    </Box>
  );
};
