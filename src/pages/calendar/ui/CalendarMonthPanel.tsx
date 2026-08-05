import { Box, Chip, Stack, Typography } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { type Dayjs } from 'dayjs';

import { CALENDAR_CARD_SX, DATE_CALENDAR_SX } from '../model/styles';

import { CalendarLegend } from './CalendarLegend';

import type { CalendarMonthStats } from '../model/utils';
import type { PickerDayProps } from '@mui/x-date-pickers/PickerDay';
import type { ComponentType } from 'react';

type CalendarMonthPanelProps = {
  selectedDate: Dayjs;
  isLoading?: boolean;
  withLegend?: boolean;
  monthStats?: CalendarMonthStats;
  onSelectDate: (date: Dayjs) => void;
  onMonthChange: (month: Dayjs) => void;
  daySlot: ComponentType<PickerDayProps>;
};

export const CalendarMonthPanel = ({
  daySlot,
  monthStats,
  selectedDate,
  onSelectDate,
  onMonthChange,
  isLoading = false,
  withLegend = true,
}: CalendarMonthPanelProps) => (
  <Stack spacing={1}>
    <Box sx={CALENDAR_CARD_SX}>
      <DateCalendar
        value={selectedDate}
        views={['year', 'month', 'day']}
        onChange={date => {
          if (!date) return;
          onSelectDate(date);
        }}
        onMonthChange={onMonthChange}
        slots={{ day: daySlot }}
        sx={{
          ...DATE_CALENDAR_SX,
          '& .MuiPickersCalendarHeader-label': {
            textTransform: 'capitalize',
          }
        }}
      />

      {withLegend && <CalendarLegend />}
    </Box>

    {monthStats && (
      <Box sx={{ ...CALENDAR_CARD_SX, borderRadius: '24px', p: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, mb: 1.25 }}
        >
          В этом месяце
        </Typography>

        {!isLoading && monthStats?.total === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            Пока нет событий по выбранным фильтрам
          </Typography>
        ) : (
          <Stack
            direction="row"
            spacing={0.75}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            <Chip
              size="small"
              label={`Событий: ${monthStats?.total}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`Дедлайны в этом месяце: ${monthStats?.deadlines}`}
              color="primary"
              variant="outlined"
            />
            {monthStats?.overdue && monthStats.overdue > 0 && (
              <Chip
                size="small"
                label={`Просрочено: ${monthStats?.overdue}`}
                color="error"
              />
            )}
            <Chip
              size="small"
              label={`Дней с задачами: ${monthStats?.daysWithEvents}`}
              variant="outlined"
            />
            {monthStats?.urgent && monthStats.urgent > 0 && (
              <Chip
                size="small"
                label={`Срочные: ${monthStats?.urgent}`}
                color="error"
                variant="outlined"
              />
            )}
          </Stack>
        )}
      </Box>
    )}
  </Stack>
);
