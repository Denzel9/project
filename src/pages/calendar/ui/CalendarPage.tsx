import { Box, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState } from 'react';

import { useAllTasksQuery } from '@/entities';
import { DatePickerProvider, PageLayout } from '@/widgets';

import { buildCalendarEvents, getCalendarDaySx } from '../model/utils';

import { CalendarTaskList } from './CalendarTaskList';

export const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());

  const { data: tasks = [], isLoading } = useAllTasksQuery();

  const events = useMemo(() => buildCalendarEvents(tasks), [tasks]);

  return (
    <PageLayout>
      <Grid
        container
        spacing={2}
      >
        <Grid size={{ xs: 12, lg: 5, xl: 4 }}>
          <Box
            sx={{
              p: { xs: 1, md: 2 },
              bgcolor: 'white',
              borderRadius: '32px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {isLoading ? (
              <Skeleton
                variant="rounded"
                height={320}
                sx={{ borderRadius: '24px' }}
              />
            ) : (
              <DatePickerProvider>
                <DateCalendar
                  value={selectedDate}
                  views={['year', 'month', 'day']}
                  onChange={date => date && setSelectedDate(date)}
                  slotProps={{
                    day: ({ day, isDaySelected }) => ({
                      sx: getCalendarDaySx(
                        day.format('YYYY-MM-DD'),
                        events,
                        isDaySelected
                      ),
                    }),
                  }}
                />
              </DatePickerProvider>
            )}

            <Stack
              direction="row"
              spacing={1}
              sx={{ flexWrap: 'wrap', gap: 1, px: 2, pb: 2, pt: 1 }}
            >
              <Chip
                size="small"
                variant="outlined"
                label="Прошлое"
                sx={{ color: 'text.disabled', borderColor: 'divider' }}
              />
              <Chip
                size="small"
                variant="outlined"
                color="primary"
                label="Сегодня"
              />
              <Chip
                size="small"
                variant="outlined"
                label="Будущее"
              />
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', px: 2, pb: 2 }}
            >
              Точка под днём — есть задачи. Красная — просроченный дедлайн. Одна
              задача может отображаться в день создания и в день дедлайна.
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 7, xl: 8 }}>
          <CalendarTaskList
            events={events}
            isLoading={isLoading}
            selectedDate={selectedDate}
          />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default CalendarPage;
