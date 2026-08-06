import { Grid } from '@mui/material';
import { PickerDay } from '@mui/x-date-pickers/PickerDay';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState, type ComponentProps } from 'react';

import { useMyTaskFilterStore } from '@/features';
import { PageLayout } from '@/widgets';

import { DEFAULT_CALENDAR_FILTERS } from '../model/constants';
import { useCalendarFilterOptions } from '../model/useCalendarFilterOptions';
import { useCalendarTasks } from '../model/useCalendarTasks';
import {
  buildCalendarEvents,
  buildCalendarPostMetaMap,
  filterCalendarTasksByPostMeta,
  filterEventsInMonthRange,
  getCalendarMonthStats,
} from '../model/utils';

import { CalendarFilters } from './CalendarFilters';
import { CalendarMonthPanel } from './CalendarMonthPanel';
import { CalendarPickerDay } from './CalendarPickerDay';
import { CalendarTaskList } from './CalendarTaskList';

import type { CalendarFiltersState } from '../model/types';

export const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(() => dayjs());
  const [filters, setFilters] = useState<CalendarFiltersState>(
    DEFAULT_CALENDAR_FILTERS
  );
  const onlyMyTasks = useMyTaskFilterStore(state => state.onlyMyTasks);
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId
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
    onlyMyTasks,
    assigneeAccountId,
  });

  const postMetaMap = useMemo(
    () => buildCalendarPostMetaMap(rawTasks),
    [rawTasks]
  );

  const tasks = useMemo(
    () => filterCalendarTasksByPostMeta(rawTasks, postMetaMap, filters),
    [rawTasks, postMetaMap, filters]
  );

  const events = useMemo(() => {
    const calendarEvents = buildCalendarEvents(tasks, filters.eventType);

    return filterEventsInMonthRange(
      calendarEvents,
      monthRange.dateFrom,
      monthRange.dateTo
    );
  }, [tasks, filters.eventType, monthRange.dateFrom, monthRange.dateTo]);

  const monthStats = useMemo(() => getCalendarMonthStats(events), [events]);

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
    [events]
  );

  const handleFiltersChange = (patch: Partial<CalendarFiltersState>) => {
    setFilters(current => ({ ...current, ...patch }));
  };

  const handleFiltersReset = () => {
    setFilters(DEFAULT_CALENDAR_FILTERS);
  };

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    setVisibleMonth(date);
  };

  return (
    <PageLayout withFooter={false}>
      <CalendarFilters
        selectedDate={selectedDate}
        events={events}
        isLoading={isLoading}
        value={filters}
        onChange={handleFiltersChange}
        onReset={handleFiltersReset}
        companyOptions={companyOptions}
        isCompany={isCompany}
        isLoadingCompanies={isLoadingCompanies}
      />

      <Grid
        container
        spacing={1}
        sx={{ alignItems: 'stretch' }}
      >
        <Grid
          size={{ xs: 12, lg: 5, xl: 4 }}
          sx={{
            top: { lg: 16 },
            zIndex: { lg: 1 },
            position: { lg: 'sticky' },
            alignSelf: { lg: 'flex-start' },
          }}
        >
          <CalendarMonthPanel
            selectedDate={selectedDate}
            isLoading={isLoading}
            monthStats={monthStats}
            daySlot={CalendarDay}
            onSelectDate={handleSelectDate}
            onMonthChange={setVisibleMonth}
          />
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
            isCompany={isCompany}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default CalendarPage;
