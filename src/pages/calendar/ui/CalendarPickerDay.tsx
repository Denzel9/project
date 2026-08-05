import { Box, Tooltip } from '@mui/material';
import { PickerDay } from '@mui/x-date-pickers/PickerDay';

import {
  CALENDAR_DAY_CELL_HEIGHT,
  CALENDAR_DAY_CELL_WIDTH,
  CALENDAR_DAY_SIZE,
} from '../model/styles';
import {
  getCalendarDayStats,
  getCalendarDaySx,
  getCalendarDayTooltip,
  getDateCategory,
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
  const stats = getCalendarDayStats(events, dateKey);
  const category = getDateCategory(dateKey);
  const hasEvents = stats.total > 0;
  const tooltip = getCalendarDayTooltip(stats, {
    isToday: category === 'today',
  });

  const markerColor = stats.overdue
    ? 'error.main'
    : category === 'today'
      ? 'primary.main'
      : category === 'future'
        ? 'info.main'
        : 'text.disabled';

  return (
    <Tooltip
      title={tooltip}
      arrow
      disableHoverListener={!hasEvents}
      enterDelay={400}
    >
      <Box
        sx={{
          width: CALENDAR_DAY_CELL_WIDTH,
          height: CALENDAR_DAY_CELL_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <PickerDay
          {...props}
          day={day}
          selected={selected}
          sx={{
            ...getCalendarDaySx(dateKey, selected),
            width: CALENDAR_DAY_SIZE,
            height: CALENDAR_DAY_SIZE,
          }}
        />

        <Box
          sx={{
            height: 10,
            mt: 0.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.35,
          }}
        >
          {hasEvents && (
            <>
              <Box
                sx={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  bgcolor: markerColor,
                }}
              />
              {stats.total > 1 && stats.deadlines > 0 && stats.created > 0 && (
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    bgcolor:
                      markerColor === 'error.main'
                        ? 'error.light'
                        : 'text.disabled',
                  }}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Tooltip>
  );
};
