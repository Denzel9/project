import { Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Link } from 'react-router';

import { TASK_STATUS_LABELS, type Task } from '@/entities/task';
import { getUserName, type User } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { MediaPreview } from '@/widgets/media/ui/MediaPreview';

type TaskItemProps = {
  task: Task;
};

export const TaskItem = ({ task }: TaskItemProps) => {
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
            <Link
              to={`${ROUTES.POST}/${task?.post?.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography
                variant="h6"
                sx={{
                  cursor: 'pointer',
                  transition: 'text-decoration 0.2s ease',
                  ':hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                {task.post?.title}
              </Typography>
            </Link>

            <Link
              to={`${ROUTES.PROFILE}?userId=${task.ownerId}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography
                variant="body1"
                sx={{
                  cursor: 'pointer',
                  transition: 'text-decoration 0.2s ease',
                  ':hover': {
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                {getUserName(task.owner as Partial<User>)}
              </Typography>
            </Link>
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
        sx={{ justifyContent: 'space-between', alignItems: 'end', mt: 4 }}
      >
        <MediaPreview media={task?.media} />

        {task.finalDate && (
          <Typography
            variant="body2"
            color="info"
            sx={{ fontSize: '12px', textAlign: 'right' }}
          >
            Дедлайн: {format(new Date(task.finalDate ?? ''), 'dd.MM.yyyy')}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
