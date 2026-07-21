import { Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router';

import { isTaskOverdue, type Task } from '@/entities';
import {
  executorToUserPartial,
  getUserName,
  UserDisplayName,
  type User,
} from '@/entities/user';
import { getTaskConfig } from '@/features';
import { ROUTES } from '@/shared';

import { TaskActionsMenu } from './TaskActionsMenu';

type TaskItemProps = {
  task: Task;
  isCompany: boolean;
};

const getContact = (task: Task, isCompany: boolean) => {
  if (isCompany) {
    const user = executorToUserPartial(task.executor ?? undefined);

    return {
      user,
      name: getUserName(user) || 'Исполнитель не назначен',
      avatar: task.executor?.avatar ?? '',
      label: 'Исполнитель',
    };
  }

  const user = task.owner as Partial<User>;

  return {
    user,
    name: getUserName(user) || 'Компания',
    avatar: task.owner?.avatar ?? '',
    label: 'Заказчик',
  };
};

export const TaskItem = ({ task, isCompany }: TaskItemProps) => {
  const taskConfig = getTaskConfig(task.status);
  const accentColor = taskConfig?.color ?? 'primary';
  const contact = getContact(task, isCompany);
  const overdue = isTaskOverdue(task);

  return (
    <Box
      component={Link}
      to={`${ROUTES.TASK}/${task.post?.id}?taskId=${task.id}&inviteId=${task.id}`}
      sx={{
        p: 2,
        height: '100%',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white',
        borderRadius: '24px',
        textDecoration: 'none',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        ':hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ flexWrap: 'wrap', gap: 0.75 }}
        >
          <Chip
            size="small"
            label={taskConfig?.label}
            color={accentColor}
            sx={{ opacity: 0.75 }}
          />

          {task.urgent && <Whatshot color="error" />}
        </Stack>

        <Stack
          spacing={0.5}
          direction="row"
          sx={{ alignItems: 'center' }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap' }}
          >
            {formatDistanceToNow(new Date(task.updatedAt), {
              addSuffix: true,
              locale: ru,
            })}
          </Typography>

          <Box
            component="span"
            onClick={event => event.stopPropagation()}
            onMouseDown={event => event.stopPropagation()}
          >
            <TaskActionsMenu
              task={task}
              size="small"
            />
          </Box>
        </Stack>
      </Stack>

      <Typography
        variant="subtitle1"
        sx={{
          mb: 0.5,
          fontWeight: 600,
          overflow: 'hidden',
          WebkitLineClamp: 2,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
        }}
      >
        {task.post?.title ?? 'Без названия'}
      </Typography>

      {task.title && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1.5,
            overflow: 'hidden',
            WebkitLineClamp: 1,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
          }}
        >
          {task.title}
        </Typography>
      )}

      <Stack
        direction="row"
        sx={{
          mt: 'auto',
          pt: 2,
          minWidth: 0,
          alignItems: 'end',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          spacing={1}
          direction="row"
          sx={{ alignItems: 'center' }}
        >
          <Avatar
            src={contact.avatar || undefined}
            sx={{ width: 32, height: 32 }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.2 }}
            >
              {contact.label}
            </Typography>
            <UserDisplayName user={contact.user} />
          </Box>
        </Stack>

        {task.finalDate && (
          <Chip
            size="small"
            sx={{ opacity: 0.75 }}
            color={overdue ? 'error' : 'default'}
            variant={overdue ? 'filled' : 'outlined'}
            label={`Дедлайн: ${format(new Date(task.finalDate), 'dd.MM.yyyy')}`}
          />
        )}
      </Stack>
    </Box>
  );
};
