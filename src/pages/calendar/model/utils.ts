import dayjs from 'dayjs';

import { isTaskOverdue, type Task } from '@/entities';

import type { SxProps, Theme } from '@mui/material';

export type CalendarEventType = 'created' | 'deadline';

export type DateCategory = 'past' | 'today' | 'future';

export type CalendarEvent = {
  task: Task;
  type: CalendarEventType;
  dateKey: string;
};

export const toDateKey = (iso: string) => dayjs(iso).format('YYYY-MM-DD');

export const getDateCategory = (dateKey: string): DateCategory => {
  const date = dayjs(dateKey).startOf('day');
  const today = dayjs().startOf('day');

  if (date.isBefore(today)) return 'past';
  if (date.isAfter(today)) return 'future';

  return 'today';
};

export const getEventLabel = (type: CalendarEventType) =>
  type === 'deadline' ? 'Дедлайн' : 'Создана';

export { isTaskOverdue } from '@/entities';

export const buildCalendarEvents = (tasks: Task[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  tasks.forEach(task => {
    const createdDateKey = toDateKey(task.createdAt);
    events.push({
      task,
      type: 'created',
      dateKey: createdDateKey,
    });

    if (task.finalDate) {
      const deadlineDateKey = toDateKey(task.finalDate);

      if (deadlineDateKey !== createdDateKey) {
        events.push({
          task,
          type: 'deadline',
          dateKey: deadlineDateKey,
        });
      }
    }
  });

  return events;
};

export const groupEventsByDate = (events: CalendarEvent[]) => {
  const map = new Map<string, CalendarEvent[]>();

  events.forEach(event => {
    const existing = map.get(event.dateKey) ?? [];
    map.set(event.dateKey, [...existing, event]);
  });

  return map;
};

export const sortCalendarEvents = (events: CalendarEvent[]) =>
  [...events].sort((left, right) => {
    if (left.type !== right.type) {
      return left.type === 'deadline' ? -1 : 1;
    }

    if (left.task.urgent !== right.task.urgent) {
      return left.task.urgent ? -1 : 1;
    }

    const leftTitle = left.task.title || left.task.post?.title || '';
    const rightTitle = right.task.title || right.task.post?.title || '';

    return leftTitle.localeCompare(rightTitle, 'ru');
  });

export const hasOverdueDeadlineOnDate = (
  events: CalendarEvent[],
  dateKey: string,
) =>
  events.some(
    event =>
      event.dateKey === dateKey &&
      event.type === 'deadline' &&
      isTaskOverdue(event.task),
  );

export const getCalendarDaySx = (
  dateKey: string,
  events: CalendarEvent[],
  selected = false,
): SxProps<Theme> => {
  const dayEvents = events.filter(event => event.dateKey === dateKey);
  const hasEvents = dayEvents.length > 0;
  const category = getDateCategory(dateKey);
  const hasOverdue = hasOverdueDeadlineOnDate(events, dateKey);

  return {
    position: 'relative',
    fontWeight: category === 'today' ? 700 : 400,
    color: category === 'past' && !selected ? 'text.disabled' : undefined,
    border:
      category === 'today' && !selected
        ? theme => `1px solid ${theme.palette.primary.main}`
        : undefined,
    '&::after': hasEvents
      ? {
          content: '""',
          position: 'absolute',
          bottom: 4,
          width: hasOverdue ? 8 : 6,
          height: hasOverdue ? 8 : 6,
          borderRadius: '50%',
          bgcolor: hasOverdue
            ? 'error.main'
            : category === 'today'
              ? 'primary.main'
              : category === 'future'
                ? 'info.main'
                : 'text.secondary',
        }
      : undefined,
  };
};
