import { Whatshot } from '@mui/icons-material';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import { TASK_STATUS_LABELS, type Task } from '@/entities/task';
import { ROUTES } from '@/shared/config/routes';

type TaskItemProps = {
  task: Task;
};

export const TaskItem = ({ task }: TaskItemProps) => (
  <Box
    component={Link}
    to={`${ROUTES.TASK}/${task.id}`}
    sx={{
      p: 3,
      height: '100%',
      display: 'block',
      borderRadius: '24px',
      textDecoration: 'none',
      color: 'inherit',
      border: theme => `1px solid ${theme.palette.secondary.main}`,
      transition: 'box-shadow 0.2s ease',
      ':hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    }}
  >
    <Stack
      direction="row"
      sx={{
        gap: 2,
        alignItems: 'start',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <Typography
            variant="h6"
            noWrap
          >
            {task.description.slice(0, 80) || 'Задача'}
          </Typography>
          {task.urgent && <Whatshot color="error" />}
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 1,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.description}
        </Typography>

        {task.finalDate && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Дедлайн:{' '}
            {new Date(task.finalDate).toLocaleDateString('ru-RU')}
          </Typography>
        )}
      </Box>

      <Chip
        size="small"
        label={TASK_STATUS_LABELS[task.status]}
        color={task.status === 'COMPLETED' ? 'success' : 'primary'}
        sx={{ flexShrink: 0 }}
      />
    </Stack>
  </Box>
);
