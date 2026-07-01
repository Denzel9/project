import { Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router';

import { isTaskOverdue, type Task } from '@/entities';
import { getUserName, type User } from '@/entities';
import { getTaskConfig } from '@/features';
import { ROUTES } from '@/shared';

import { TaskActionsMenu } from './TaskActionsMenu';

type TaskItemProps = {
  task: Task;
  isCompany: boolean;
};

const getContact = (task: Task, isCompany: boolean) => {
  if (isCompany) {
    const name = [task.executor?.name, task.executor?.lastName]
      .filter(Boolean)
      .join(' ');

    return {
      name: name || 'Исполнитель не назначен',
      avatar: task.executor?.avatar ?? '',
      label: 'Исполнитель',
    };
  }

  return {
    name: getUserName(task.owner as Partial<User>) || 'Компания',
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
        borderLeftWidth: 4,
        borderLeftColor: theme => theme.palette[accentColor].main,
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
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
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
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
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
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {task.title}
        </Typography>
      )}

      <Stack
        direction="row"
        sx={{
          alignItems: 'end',
          minWidth: 0,
          mt: 2,
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
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
            <Typography
              variant="body2"
              noWrap
              sx={{ lineHeight: 1.3 }}
            >
              {contact.name}
            </Typography>
          </Box>
        </Stack>

        {task.finalDate && (
          <Chip
            size="small"
            label={`Дедлайн: ${format(new Date(task.finalDate), 'dd.MM.yyyy')}`}
            color={overdue ? 'error' : 'default'}
            variant={overdue ? 'filled' : 'outlined'}
          />
        )}
      </Stack>
    </Box>
  );
};
