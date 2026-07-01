import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { Dayjs } from 'dayjs';

import { EmptyBlock } from '@/shared';

import { sortCalendarEvents, type CalendarEvent } from '../model/utils';

import { CalendarTaskListItem } from './CalendarTaskListItem';

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
  const dateKey = selectedDate.format('YYYY-MM-DD');
  const dayEvents = sortCalendarEvents(
    events.filter(event => event.dateKey === dateKey),
  );

  const formattedDate = format(selectedDate.toDate(), 'd MMMM yyyy', {
    locale: ru,
  });

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        flex: 1,
        minHeight: 280,
        bgcolor: 'white',
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 600 }}
      >
        Задачи на {formattedDate}
      </Typography>

      {isLoading && (
        <Stack spacing={1.5}>
          {[1, 2, 3].map(item => (
            <Skeleton
              key={item}
              variant="rounded"
              height={88}
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
          sx={{ overflowY: 'auto' }}
        >
          {dayEvents.map(event => (
            <CalendarTaskListItem
              key={`${event.task.id}-${event.type}`}
              event={event}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};
