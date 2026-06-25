import { Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Link } from 'react-router';

import { type Task } from '@/entities';
import { getUserName, type User } from '@/entities';
import { getTaskConfig } from '@/features';
import { ROUTES } from '@/shared';

type TaskItemProps = {
  task: Task;
  isCompany: boolean;
};

export const TaskItem = ({ task, isCompany }: TaskItemProps) => {
  const canNavigateToPost = task?.post?.isPrivate && !isCompany;

  return (
    <Box
      component={Link}
      to={`${ROUTES.TASK}/${task.post?.id}?inviteId=${task.id}`}
      sx={{
        p: 2,
        color: 'inherit',
        bgcolor: 'white',
        display: 'block',
        borderRadius: '24px',
        textDecoration: 'none',
        transition: 'box-shadow 0.2s ease',
        border: theme => `1px solid ${theme.palette.secondary.main}`,
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
            onClick={e => e.stopPropagation()}
          >
            <Link
              to={canNavigateToPost ? '' : `${ROUTES.POST}/${task?.post?.id}`}
              style={{
                color: 'inherit',
                textDecoration: 'none',
                cursor: canNavigateToPost ? 'default' : 'pointer',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  cursor: canNavigateToPost ? 'default' : 'pointer',
                  transition: 'text-decoration 0.2s ease',
                  ':hover': canNavigateToPost
                    ? {}
                    : {
                        color: 'primary.main',
                      },
                }}
              >
                {task.post?.title}
              </Typography>

              <Typography
                variant="body2"
                color="info"
              >
                {task?.title}
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
            label={getTaskConfig(task.status)?.label}
            color={getTaskConfig(task.status)?.color ?? 'primary'}
            sx={{ flexShrink: 0 }}
          />
        </Stack>
      </Stack>

      {task.finalDate && (
        <Typography
          variant="body2"
          color="info"
          sx={{ fontSize: '12px', textAlign: 'right' }}
        >
          Дедлайн: {format(new Date(task.finalDate ?? ''), 'dd.MM.yyyy')}
        </Typography>
      )}

      <Box
        onClick={e => e.stopPropagation()}
        sx={{ mt: 4 }}
      >
        {isCompany && (
          <Link
            target="_blank"
            to={`${ROUTES.PROFILE}?userId=${task.executorId}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                ':hover': {
                  color: 'primary.main',
                },
              }}
            >
              {task?.executor?.name && task?.executor?.lastName
                ? `${task?.executor?.name} ${task?.executor?.lastName}`
                : 'Не назначено'}
            </Typography>
          </Link>
        )}

        {!isCompany && (
          <Link
            target="_blank"
            to={`${ROUTES.PROFILE}?userId=${task.ownerId}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Typography
              variant="body2"
              sx={{
                cursor: 'pointer',
                width: 'fit-content',
                transition: 'all 0.3s ease',
                ':hover': {
                  color: 'primary.main',
                },
              }}
            >
              {getUserName(task.owner as Partial<User>)}
            </Typography>
          </Link>
        )}
      </Box>
    </Box>
  );
};
