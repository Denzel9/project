import { Box, Grid } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickerDay } from '@mui/x-date-pickers/PickerDay';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState, type ComponentProps } from 'react';

import { DatePickerProvider, PageLayout } from '@/widgets';

import { DEFAULT_CALENDAR_FILTERS } from '../model/constants';
import { useCalendarFilterOptions } from '../model/useCalendarFilterOptions';
import { useCalendarTasks } from '../model/useCalendarTasks';
import {
  buildCalendarEvents,
  buildCalendarPostMetaMap,
  filterCalendarTasksByPostMeta,
  filterEventsInMonthRange,
} from '../model/utils';

import { CalendarFilters } from './CalendarFilters';
import { CalendarPickerDay } from './CalendarPickerDay';
import { CalendarTaskList } from './CalendarTaskList';

import type { CalendarFiltersState } from '../model/types';

export const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(() => dayjs());
  const [filters, setFilters] = useState<CalendarFiltersState>(
    DEFAULT_CALENDAR_FILTERS,
  );

  const { companyOptions, isCompany, isLoadingCompanies } =
    useCalendarFilterOptions();

  const monthRange = useMemo(() => {
    const month = dayjs(visibleMonth);

    return {
      dateFrom: month.startOf('month').format('YYYY-MM-DD'),
      dateTo: month.endOf('month').format('YYYY-MM-DD'),
    };
  }, [visibleMonth]);

  const { tasks: rawTasks, isLoading } = useCalendarTasks({
    ...monthRange,
    eventType: filters.eventType,
    urgentOnly: filters.urgentOnly,
    companyId: filters.companyId,
    isCompany,
  });

  const postMetaMap = useMemo(
    () => buildCalendarPostMetaMap(rawTasks),
    [rawTasks],
  );

  const tasks = useMemo(
    () => filterCalendarTasksByPostMeta(rawTasks, postMetaMap, filters),
    [rawTasks, postMetaMap, filters],
  );

  const events = useMemo(() => {
    const calendarEvents = buildCalendarEvents(tasks, filters.eventType);

    return filterEventsInMonthRange(
      calendarEvents,
      monthRange.dateFrom,
      monthRange.dateTo,
    );
  }, [tasks, filters.eventType, monthRange.dateFrom, monthRange.dateTo]);

  const CalendarDay = useMemo(
    () =>
      function CalendarDaySlot(props: ComponentProps<typeof PickerDay>) {
        return (
          <CalendarPickerDay
            {...props}
            events={events}
          />
        );
      },
    [events],
  );

  const handleFiltersChange = (patch: Partial<CalendarFiltersState>) => {
    setFilters(current => ({ ...current, ...patch }));
  };

  const handleFiltersReset = () => {
    setFilters(DEFAULT_CALENDAR_FILTERS);
  };

  return (
    <PageLayout withFooter={false}>
      <CalendarFilters
        value={filters}
        onChange={handleFiltersChange}
        onReset={handleFiltersReset}
        companyOptions={companyOptions}
        isCompany={isCompany}
        isLoadingCompanies={isLoadingCompanies}
      />

      <Grid
        container
        spacing={2}
        sx={{ alignItems: 'flex-start' }}
      >
        <Grid
          size={{ xs: 12, lg: 5, xl: 4 }}
          sx={{
            position: { lg: 'sticky' },
            top: { lg: 16 },
            zIndex: { lg: 1 },
          }}
        >
          <Box
            sx={{
              p: { xs: 1, md: 2 },
              bgcolor: 'white',
              borderRadius: '32px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <DatePickerProvider>
              <DateCalendar
                value={selectedDate}
                views={['year', 'month', 'day']}
                onChange={date => {
                  if (!date) return;

                  setSelectedDate(date);
                  setVisibleMonth(date);
                }}
                onMonthChange={month => setVisibleMonth(month)}
                slots={{
                  day: CalendarDay,
                }}
              />
            </DatePickerProvider>
          </Box>
        </Grid>

        <Grid
          size={{ xs: 12, lg: 7, xl: 8 }}
          sx={{
            display: 'flex',
            minHeight: 0,
            height: { lg: 'calc(100vh - 220px)' },
            maxHeight: { lg: 'calc(100vh - 220px)' },
          }}
        >
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
