import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import type { CalendarEventTypeFilter, CalendarFiltersState, CalendarPostMeta } from './types';
import type { TaskCalendarItem } from '@/entities';
import type { SxProps, Theme } from '@mui/material';

dayjs.extend(utc);

export type CalendarEventType = 'created' | 'deadline';

export type DateCategory = 'past' | 'today' | 'future';

export type CalendarEvent = {
  task: TaskCalendarItem;
  type: CalendarEventType;
  dateKey: string;
};

export const toDateKey = (iso: string) => dayjs.utc(iso).format('YYYY-MM-DD');

export const toCalendarDateKey = (date: dayjs.Dayjs) =>
  date.format('YYYY-MM-DD');

export const getDateCategory = (dateKey: string): DateCategory => {
  const date = dayjs.utc(dateKey).startOf('day');
  const today = dayjs.utc().startOf('day');

  if (date.isBefore(today)) return 'past';
  if (date.isAfter(today)) return 'future';

  return 'today';
};

export const getEventLabel = (type: CalendarEventType) =>
  type === 'deadline' ? 'Дедлайн' : 'Создана';

export const isCalendarTaskOverdue = (task: TaskCalendarItem) =>
  Boolean(task.finalDate) &&
  dayjs.utc(task.finalDate).isBefore(dayjs.utc(), 'day');

export const buildCalendarPostMetaMap = (
  tasks: TaskCalendarItem[],
): Map<string, CalendarPostMeta> => {
  const map = new Map<string, CalendarPostMeta>();

  tasks.forEach(task => {
    map.set(task.id, {
      platforms: task.platforms ?? [],
      placementFormats: task.placementFormats ?? [],
    });
  });

  return map;
};

export const filterCalendarTasksByPostMeta = (
  tasks: TaskCalendarItem[],
  metaMap: Map<string, CalendarPostMeta>,
  {
    platform,
    placementFormat,
  }: Pick<CalendarFiltersState, 'platform' | 'placementFormat'>,
) => {
  if (platform === 'all' && placementFormat === 'all') {
    return tasks;
  }

  return tasks.filter(task => {
    const meta = metaMap.get(task.id);

    if (!meta) return false;

    if (platform !== 'all' && !meta.platforms.includes(platform)) {
      return false;
    }

    if (
      placementFormat !== 'all' &&
      !meta.placementFormats.includes(placementFormat)
    ) {
      return false;
    }

    return true;
  });
};

export const buildCalendarEvents = (
  tasks: TaskCalendarItem[],
  eventType: CalendarEventTypeFilter = 'all',
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  tasks.forEach(task => {
    const createdDateKey = toDateKey(task.createdAt);

    if (eventType === 'all' || eventType === 'created') {
      events.push({
        task,
        type: 'created',
        dateKey: createdDateKey,
      });
    }

    if (task.finalDate && (eventType === 'all' || eventType === 'deadline')) {
      const deadlineDateKey = toDateKey(task.finalDate);

      if (deadlineDateKey !== createdDateKey || eventType === 'deadline') {
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

export const filterEventsInMonthRange = (
  events: CalendarEvent[],
  dateFrom: string,
  dateTo: string,
) =>
  events.filter(
    event => event.dateKey >= dateFrom && event.dateKey <= dateTo,
  );

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

    const leftTitle = left.task.title ?? '';
    const rightTitle = right.task.title ?? '';

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
      isCalendarTaskOverdue(event.task),
  );

export const getCalendarDaySx = (
  dateKey: string,
  selected = false,
): SxProps<Theme> => {
  const category = getDateCategory(dateKey);

  return {
    position: 'relative',
    fontWeight: category === 'today' ? 700 : 400,
    border:
      category === 'today' && !selected
        ? theme => `1px solid ${theme.palette.primary.main}`
        : undefined,
  };
};
