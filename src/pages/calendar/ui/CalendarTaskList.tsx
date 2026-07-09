import { Box, Button, Chip, Skeleton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEffect, useMemo, useState } from 'react';

import { EmptyBlock } from '@/shared';

import { CALENDAR_DAY_EVENTS_PAGE_SIZE } from '../model/constants';
import {
  sortCalendarEvents,
  toCalendarDateKey,
  type CalendarEvent,
} from '../model/utils';

import { CalendarTaskListItem } from './CalendarTaskListItem';

import type { Dayjs } from 'dayjs';

type CalendarTaskListProps = {
  selectedDate: Dayjs;
  events: CalendarEvent[];
  isLoading?: boolean;
};

export const CalendarTaskList = ({
  selectedDate,
  events,
  isLoading = false,
}: CalendarTaskListProps) => {
  const dateKey = toCalendarDateKey(selectedDate);
  const dayEvents = sortCalendarEvents(
    events.filter(event => event.dateKey === dateKey)
  );
  const [visibleCount, setVisibleCount] = useState(
    CALENDAR_DAY_EVENTS_PAGE_SIZE
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

  return (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        minHeight: { xs: 280, lg: 0 },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ mb: 2, alignItems: 'center', flexShrink: 0 }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600 }}
        >
          {formattedDate}
        </Typography>

        {!isLoading && dayEvents.length > 0 && (
          <Chip
            size="small"
            label={dayEvents.length}
          />
        )}
      </Stack>

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
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmptyBlock title="На этот день задач нет" />
        </Box>
      )}

      {!isLoading && dayEvents.length > 0 && (
        <Stack
          spacing={1.5}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          {visibleEvents.map(event => (
            <CalendarTaskListItem
              key={`${event.task.id}-${event.type}`}
              event={event}
            />
          ))}

          {hasMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleLoadMore}
              >
                Показать ещё
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};
