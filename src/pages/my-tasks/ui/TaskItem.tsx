import { Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Tooltip, Typography } from '@mui/material';
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

import { getTaskPath } from '../model/utils/utils';

import { TaskActionsMenu } from './TaskActionsMenu';

type TaskItemProps = {
  task: Task;
  isCompany: boolean;
  compact?: boolean;
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

export const TaskItem = ({
  task,
  isCompany,
  compact = false,
}: TaskItemProps) => {
  const taskConfig = getTaskConfig(task.status);
  const accentColor = taskConfig?.color ?? 'primary';
  const contact = getContact(task, isCompany);
  const overdue = isTaskOverdue(task);

  if (compact) {
    return (
      <Box
        component={Link}
        to={getTaskPath(task)}
        sx={{
          p: 1.25,
          height: '100%',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'white',
          borderRadius: '14px',
          textDecoration: 'none',
          border: '1px solid',
          borderColor: 'divider',
          borderLeftWidth: 3,
          borderLeftColor: theme => theme.palette[accentColor].main,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          ':hover': {
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-1px)',
          },
        }}
      >
        <Stack
          spacing={1}
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center', minWidth: 0, flex: 1, flexWrap: 'wrap' }}
          >
            <Chip
              size="small"
              variant="outlined"
              label={taskConfig?.label}
              color={accentColor}
              sx={{ height: 22, fontSize: '0.7rem', flexShrink: 0 }}
            />

            {task.urgent && (
              <Whatshot sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />
            )}
          </Stack>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ whiteSpace: 'nowrap', fontSize: '0.65rem', flexShrink: 0 }}
          >
            {formatDistanceToNow(new Date(task.updatedAt), {
              addSuffix: true,
              locale: ru,
            })}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {task.post?.title || 'Без названия'}
          </Typography>


        </Stack>

        <Tooltip title={task.title}>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
            }}
          >
            {task.title || 'Без названия'}
          </Typography>
        </Tooltip>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1,
            minWidth: 0,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', minWidth: 0 }}
          >
            <Avatar
              src={contact.avatar || undefined}
              sx={{ width: 24, height: 24, flexShrink: 0 }}
            />
            <UserDisplayName
              variant="body2"
              withBadges={false}
              user={contact.user}
              sx={{
                overflow: 'hidden',
                '& .MuiTypography-root': {
                  fontSize: '0.75rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                },
              }}
            />
          </Stack>

          {task.finalDate && (
            <Tooltip title={overdue ? 'Просрочено' : 'Дедлайн'}>
              <Chip
                size="small"
                label={format(new Date(task.finalDate), 'dd.MM.yy')}
                color={overdue ? 'error' : 'default'}
                variant={overdue ? 'filled' : 'outlined'}
                sx={{ height: 22, fontSize: '0.7rem', opacity: 0.85 }}
              />
            </Tooltip>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component={Link}
      to={getTaskPath(task)}
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
          sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}
        >
          <Chip
            size="small"
            variant="outlined"
            label={taskConfig?.label}
            color={accentColor}
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
        {task.post?.title || 'Без названия'}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 1.5,
        }}
      >
        {task.title || 'Без названия'}
      </Typography>

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

          <UserDisplayName
            variant="body2"
            withBadges={false}
            user={contact.user}
          />
        </Stack>

        {task.finalDate && (
          <Tooltip title={overdue ? 'Просрочено' : 'Дедлайн'}>
            <Chip
              size="small"
              variant={'outlined'}
              color={overdue ? 'error' : 'default'}
              label={`Дедлайн: ${format(new Date(task.finalDate), 'dd.MM.yyyy')}`}
            />
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
};
