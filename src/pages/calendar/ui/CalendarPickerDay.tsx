import { Box } from '@mui/material';
import { PickerDay } from '@mui/x-date-pickers/PickerDay';

import {
  getCalendarDaySx,
  getDateCategory,
  hasOverdueDeadlineOnDate,
  toCalendarDateKey,
  type CalendarEvent,
} from '../model/utils';

import type { ComponentProps } from 'react';

type CalendarPickerDayProps = ComponentProps<typeof PickerDay> & {
  events: CalendarEvent[];
};

export const CalendarPickerDay = ({
  events,
  day,
  selected = false,
  ...props
}: CalendarPickerDayProps) => {
  const dateKey = toCalendarDateKey(day);
  const hasEvents = events.some(event => event.dateKey === dateKey);
  const category = getDateCategory(dateKey);
  const hasOverdue = hasOverdueDeadlineOnDate(events, dateKey);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <PickerDay
        {...props}
        day={day}
        selected={selected}
        sx={getCalendarDaySx(dateKey, selected)}
      />

      {hasEvents && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            left: '50%',
            width: hasOverdue ? 8 : 6,
            height: hasOverdue ? 8 : 6,
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            bgcolor: hasOverdue
              ? 'error.main'
              : category === 'today'
                ? 'primary.main'
                : category === 'future'
                  ? 'info.main'
                  : 'text.secondary',
          }}
        />
      )}
    </Box>
  );
};
