import {
  ChevronLeft,
  ChevronRight,
  EventOutlined,
  ScheduleOutlined,
  Whatshot,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { EmptyBlock } from '@/shared';

import { CALENDAR_DAY_EVENTS_PAGE_SIZE } from '../model/constants';
import {
  findNearestDayWithEvents,
  getCalendarDayStats,
  sortCalendarEvents,
  toCalendarDateKey,
  type CalendarEvent,
} from '../model/utils';

import { CalendarTaskListItem } from './CalendarTaskListItem';

type CalendarTaskListProps = {
  selectedDate: Dayjs;
  isLoading?: boolean;
  withHeader?: boolean;
  events: CalendarEvent[];
  onGoToToday: () => void;
  onSelectDate: (date: Dayjs) => void;
};

export const CalendarTaskList = ({
  events,
  onGoToToday,
  onSelectDate,
  selectedDate,
  isLoading = false,
  withHeader = true,
}: CalendarTaskListProps) => {
  const dateKey = toCalendarDateKey(selectedDate);
  const dayEvents = sortCalendarEvents(
    events.filter(event => event.dateKey === dateKey)
  );
  const dayStats = getCalendarDayStats(dayEvents);
  const [visibleCount, setVisibleCount] = useState(
    CALENDAR_DAY_EVENTS_PAGE_SIZE
  );

  const isToday = dateKey === toCalendarDateKey(dayjs());
  const nearestDayKey = useMemo(
    () =>
      dayEvents.length === 0 ? findNearestDayWithEvents(events, dateKey) : null,
    [dayEvents.length, events, dateKey]
  );

  useEffect(() => {
    setTimeout(() => {
      setVisibleCount(CALENDAR_DAY_EVENTS_PAGE_SIZE);
    }, 0);
  }, [dateKey, dayEvents.length]);

  const visibleEvents = useMemo(
    () => dayEvents.slice(0, visibleCount),
    [dayEvents, visibleCount]
  );

  const hiddenCount = dayEvents.length - visibleEvents.length;
  const hasMore = hiddenCount > 0;

  const handleLoadMore = () => {
    setVisibleCount(current =>
      Math.min(current + CALENDAR_DAY_EVENTS_PAGE_SIZE, dayEvents.length)
    );
  };

  const formattedDate = format(selectedDate.toDate(), 'd MMMM yyyy', {
    locale: ru,
  });

  const nearestDayLabel = nearestDayKey
    ? format(dayjs(nearestDayKey).toDate(), 'd MMMM', { locale: ru })
    : null;

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        minHeight: { xs: 280, lg: 0 },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: { xs: 1.5, md: 2 },
        bgcolor: 'white',
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {withHeader && (
        <Stack
          spacing={1.25}
          sx={{ mb: 2, flexShrink: 0 }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              flexWrap: 'wrap',
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', minWidth: 0 }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600 }}
              >
                {formattedDate}
              </Typography>

              {!isLoading && dayStats.total > 0 && (
                <Chip
                  size="small"
                  label={dayStats.total}
                />
              )}
            </Stack>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: 'center' }}
            >
              <Tooltip title="Предыдущий день">
                <IconButton
                  size="small"
                  aria-label="Предыдущий день"
                  onClick={() => onSelectDate(selectedDate.subtract(1, 'day'))}
                >
                  <ChevronLeft />
                </IconButton>
              </Tooltip>

              <Button
                size="small"
                variant={isToday ? 'contained' : 'outlined'}
                onClick={onGoToToday}
                disabled={isToday}
                sx={{ minWidth: 84 }}
              >
                Сегодня
              </Button>

              <Tooltip title="Следующий день">
                <IconButton
                  size="small"
                  aria-label="Следующий день"
                  onClick={() => onSelectDate(selectedDate.add(1, 'day'))}
                >
                  <ChevronRight />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {!isLoading && dayStats.total > 0 && (
            <Stack
              direction="row"
              spacing={0.75}
              useFlexGap
              sx={{ flexWrap: 'wrap' }}
            >
              {dayStats.deadlines > 0 && (
                <Chip
                  size="small"
                  icon={
                    <ScheduleOutlined sx={{ fontSize: '16px !important' }} />
                  }
                  label={`Дедлайны сегодня: ${dayStats.deadlines}`}
                  color="primary"
                  variant="outlined"
                />
              )}
              {dayStats.created > 0 && (
                <Chip
                  size="small"
                  icon={<EventOutlined sx={{ fontSize: '16px !important' }} />}
                  label={`Созданы: ${dayStats.created}`}
                  variant="outlined"
                />
              )}
              {dayStats.overdue > 0 && (
                <Chip
                  size="small"
                  label={`Просрочено: ${dayStats.overdue}`}
                  color="error"
                />
              )}
              {dayStats.urgent > 0 && (
                <Chip
                  size="small"
                  icon={<Whatshot sx={{ fontSize: '14px !important' }} />}
                  label={`Из них срочные: ${dayStats.urgent}`}
                  color="error"
                  variant="outlined"
                />
              )}
            </Stack>
          )}
        </Stack>
      )}

      {isLoading && (
        <Stack spacing={1.5}>
          {[1, 2, 3].map(item => (
            <Skeleton
              key={item}
              variant="rounded"
              height={108}
              sx={{ borderRadius: '20px' }}
            />
          ))}
        </Stack>
      )}

      {!isLoading && dayEvents.length === 0 && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            px: 2,
          }}
        >
          <EmptyBlock title="На этот день задач нет" />

          {nearestDayKey && nearestDayLabel && (
            <Button
              variant="outlined"
              onClick={() => onSelectDate(dayjs(nearestDayKey))}
            >
              Перейти к {nearestDayLabel}
            </Button>
          )}
        </Box>
      )}

      {!isLoading && dayEvents.length > 0 && (
        <Stack
          spacing={1.5}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            pr: 0.5,
            scrollbarWidth: 'none',
          }}
        >
          {visibleEvents.map(event => (
            <CalendarTaskListItem
              event={event}
              key={`${event.task.id}-${event.type}`}
            />
          ))}

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleLoadMore}
              >
                Показать ещё ({hiddenCount})
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};
