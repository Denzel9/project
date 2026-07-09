import { EventOutlined, ScheduleOutlined, Whatshot } from '@mui/icons-material';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link } from 'react-router';

import { USER_ROLE, type TaskCalendarItem } from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';

import {
  getEventLabel,
  isCalendarTaskOverdue,
  type CalendarEvent,
} from '../model/utils';

type CalendarTaskListItemProps = {
  event: CalendarEvent;
};

const getContact = (task: TaskCalendarItem, isCompany: boolean) => {
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

  const name =
    task.owner?.companyProfile?.companyName ??
    [task.owner?.creatorProfile?.name, task.owner?.creatorProfile?.lastName]
      .filter(Boolean)
      .join(' ');

  return {
    name: name || 'Заказчик',
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
      to={`${ROUTES.TASK}/${task.id}?taskId=${task.id}&inviteId=${task.id}`}
      sx={{
        p: 1.75,
        display: 'block',
        color: 'inherit',
        bgcolor: 'white',
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
          <Chip
            size="small"
            icon={<EventIcon sx={{ fontSize: '16px !important' }} />}
            label={getEventLabel(type)}
            color={isDeadline ? 'primary' : 'default'}
            variant={isDeadline ? 'filled' : 'outlined'}
            sx={{ height: 24, '& .MuiChip-label': { px: 0.75 } }}
          />

          {task.urgent && (
            <Whatshot sx={{ fontSize: 18, color: 'error.main' }} />
          )}

          {isOverdue && (
            <Chip
              size="small"
              label="Просрочено"
              color="error"
              sx={{ height: 24 }}
            />
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
        variant="body2"
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
        >
          {contact.name.charAt(0)}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              lineHeight: 1.2,
              fontSize: '0.65rem',
            }}
          >
            {contact.label}
          </Typography>
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              lineHeight: 1.2,
              fontWeight: 500,
            }}
          >
            {contact.name}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
