import { OpenInNew, Whatshot } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useNavigate } from 'react-router';

import { TASK_STATUS_LABELS, type Task } from '@/entities/task';
import { getUserName, type User } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { MediaPreview } from '@/widgets/media/ui/MediaPreview';

type TaskItemProps = {
  task: Task;
};

export const TaskItem = ({ task }: TaskItemProps) => {
  const navigate = useNavigate();
  return (
    <Box
      component={Link}
      to={`${ROUTES.TASK}/${task.id}`}
      sx={{
        p: 2,
        color: 'inherit',
        bgcolor: 'white',
        display: 'block',
        borderRadius: '24px',
        textDecoration: 'none',
        border: theme => `1px solid ${theme.palette.secondary.main}`,
        transition: 'box-shadow 0.2s ease',
        ':hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'start', justifyContent: 'space-between' }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'start' }}
        >
          <Avatar
            src={task.owner?.avatar ?? ''}
            sx={{ width: 60, height: 60 }}
          />
          <Stack
            direction="column"
            spacing={0}
          >
            <Typography
              variant="h6"
              noWrap
            >
              {task.post.title}
            </Typography>
            {/* <Typography
              variant="h6"
              noWrap
            >
              {task.executor.lastName}
            </Typography> */}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
        >
          {task.urgent && <Whatshot color="error" />}
          <Chip
            size="small"
            label={TASK_STATUS_LABELS[task.status]}
            color={task.status === 'COMPLETED' ? 'success' : 'primary'}
            sx={{ flexShrink: 0 }}
          />
        </Stack>
      </Stack>

      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', mt: 4 }}
      >
        <Typography
          variant="body1"
          onClick={() => navigate(`${ROUTES.TASK}/${task.id}`)}
          sx={{
            cursor: 'pointer',
            transition: 'text-decoration 0.2s ease',
            ':hover': { textDecoration: 'underline', color: 'primary.main' },
          }}
        >
          {getUserName(task.owner as Partial<User>)}
        </Typography>

        <IconButton>
          <OpenInNew />
        </IconButton>
      </Stack>

      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'end', mt: 4 }}
      >
        <MediaPreview media={task?.media} />

        {!task.finalDate && (
          <Typography
            variant="body2"
            color="info"
            sx={{ fontSize: '12px', textAlign: 'right' }}
          >
            Дедлайн:{' '}
            {new Date(task.finalDate ?? '').toLocaleDateString('ru-RU')}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
