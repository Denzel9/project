import { EventOutlined, ScheduleOutlined, Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router';

import { USER_ROLE, type TaskCalendarItem, type TaskCalendarParticipant } from '@/entities';
import {
  executorToUserPartial,
  getUserName,
  UserDisplayName,
  type User,
} from '@/entities/user';
import { useAuthStore } from '@/features';

import {
  getCalendarTaskPath,
  getEventLabel,
  isCalendarTaskOverdue,
  type CalendarEvent,
} from '../model/utils';

type CalendarTaskListItemProps = {
  event: CalendarEvent;
};

const calendarParticipantToUser = (
  participant?: TaskCalendarParticipant | null
): Partial<User> | undefined => {
  if (!participant?.id) return undefined;

  if (participant.companyName) {
    return {
      id: participant.id,
      companyProfile: {
        companyName: participant.companyName,
      } as User['companyProfile'],
    };
  }

  return executorToUserPartial({
    id: participant.id,
    name: participant.name,
    lastName: participant.lastName,
  });
};

const getContact = (task: TaskCalendarItem, isCompany: boolean) => {
  if (isCompany) {
    const user = calendarParticipantToUser(task.executor);

    return {
      user,
      name: getUserName(user) || 'Исполнитель не назначен',
      avatar: task.executor?.avatar ?? '',
      label: 'Исполнитель',
    };
  }

  const user = calendarParticipantToUser(task.owner);

  return {
    user,
    name: getUserName(user) || 'Заказчик',
    avatar: task.owner?.avatar ?? '',
    label: 'Заказчик',
  };
};

const getEventTime = (event: CalendarEvent) => {
  const source =
    event.type === 'deadline' ? event.task.finalDate : event.task.createdAt;

  if (!source) return null;

  return format(new Date(source), 'HH:mm', { locale: ru });
};

export const CalendarTaskListItem = ({ event }: CalendarTaskListItemProps) => {
  const { task, type } = event;
  const { role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;

  const title = task.title?.trim() || 'Без названия';
  const isDeadline = type === 'deadline';
  const isOverdue = isDeadline && isCalendarTaskOverdue(task);
  const contact = getContact(task, isCompany);
  const eventTime = getEventTime(event);
  const EventIcon = isDeadline ? ScheduleOutlined : EventOutlined;

  return (
    <Box
      component={Link}
      to={getCalendarTaskPath(task)}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        p: 1.75,
        display: 'block',
        color: 'inherit',
        bgcolor: 'background.paper',
        borderRadius: '16px',
        textDecoration: 'none',
        border: '1px solid',
        borderColor: 'divider',
        borderLeftWidth: 3,
        borderLeftColor: isOverdue
          ? 'error.main'
          : isDeadline
            ? 'primary.main'
            : 'info.main',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          mb: 1,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
        >
          {!isOverdue && (
            <Chip
              size="small"
              icon={<EventIcon sx={{ fontSize: '16px !important' }} />}
              label={getEventLabel(type, event.dateKey)}
              color={isDeadline ? 'primary' : 'default'}
              variant={isDeadline ? 'filled' : 'outlined'}
              sx={{ height: 24, '& .MuiChip-label': { px: 0.75 } }}
            />
          )}

          {isOverdue && (
            <Chip
              size="small"
              label="Просрочено"
              color="error"
              sx={{ height: 24 }}
            />
          )}

          {task.urgent && (
            <Whatshot sx={{ fontSize: 18, color: 'error.main' }} />
          )}
        </Stack>

        {eventTime && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ flexShrink: 0, whiteSpace: 'nowrap', pt: 0.25 }}
          >
            {eventTime}
          </Typography>
        )}
      </Stack>

      <Typography
        variant="body1"
        sx={{
          mb: 1.25,
          fontWeight: 600,
          lineHeight: 1.35,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {title}
      </Typography>

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: 'center', minWidth: 0 }}
      >
        <Avatar
          src={contact.avatar || undefined}
          sx={{ width: 26, height: 26, flexShrink: 0 }}
        />

        <UserDisplayName
          name={contact.name}
          user={contact.user}
          variant="body2"
          withBadges={false}
        />
      </Stack>
    </Box>
  );
};
