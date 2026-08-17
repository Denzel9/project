import { CalendarMonthOutlined, OpenInNewOutlined } from '@mui/icons-material';
import { Box, Grid, IconButton, Stack, Typography } from '@mui/material';
import { PickerDay } from '@mui/x-date-pickers/PickerDay';
import dayjs, { type Dayjs } from 'dayjs';
import { useMemo, useState, type ComponentProps } from 'react';
import { useNavigate } from 'react-router';

import { USER_ROLE } from '@/entities';
import {
  getDashboardPeriodRange,
  useAuthStore,
  useMyTaskFilterStore,
} from '@/features';
import { DEFAULT_CALENDAR_FILTERS } from '@/pages/calendar/model/constants';
import { useCalendarTasks } from '@/pages/calendar/model/useCalendarTasks';
import {
  buildCalendarEvents,
  filterEventsInMonthRange,
  toDateKey,
} from '@/pages/calendar/model/utils';
import { CalendarMonthPanel } from '@/pages/calendar/ui/CalendarMonthPanel';
import { CalendarPickerDay } from '@/pages/calendar/ui/CalendarPickerDay';
import { CalendarTaskList } from '@/pages/calendar/ui/CalendarTaskList';
import { ROUTES } from '@/shared';

export const DashboardCalendarPanel = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;
  const onlyMyTasks = useMyTaskFilterStore(state => state.onlyMyTasks);
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId
  );
  const postId = useMyTaskFilterStore(state => state.postId);
  const executorId = useMyTaskFilterStore(state => state.executorId);
  const period = useMyTaskFilterStore(state => state.period);

  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(() => dayjs());

  const monthRange = useMemo(() => {
    const month = dayjs(visibleMonth);

    return {
      dateFrom: month.startOf('month').format('YYYY-MM-DD'),
      dateTo: month.endOf('month').format('YYYY-MM-DD'),
    };
  }, [visibleMonth]);

  const periodRange = useMemo(() => getDashboardPeriodRange(period), [period]);

  const { tasks: rawTasks, isLoading } = useCalendarTasks({
    ...monthRange,
    eventType: DEFAULT_CALENDAR_FILTERS.eventType,
    urgentOnly: DEFAULT_CALENDAR_FILTERS.urgentOnly,
    companyId: DEFAULT_CALENDAR_FILTERS.companyId,
    isCompany,
    onlyMyTasks,
    assigneeAccountId,
    postId,
    executorId,
  });

  const tasks = useMemo(() => {
    if (!periodRange.dateFrom || !periodRange.dateTo) return rawTasks;

    return rawTasks.filter(task => {
      if (!task.finalDate) return false;

      const deadline = toDateKey(task.finalDate);

      return (
        deadline >= periodRange.dateFrom! && deadline <= periodRange.dateTo!
      );
    });
  }, [periodRange.dateFrom, periodRange.dateTo, rawTasks]);

  const events = useMemo(() => {
    const calendarEvents = buildCalendarEvents(
      tasks,
      DEFAULT_CALENDAR_FILTERS.eventType
    );

    return filterEventsInMonthRange(
      calendarEvents,
      monthRange.dateFrom,
      monthRange.dateTo
    );
  }, [tasks, monthRange.dateFrom, monthRange.dateTo]);

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

  const handleSelectDate = (date: Dayjs) => {
    setSelectedDate(date);
    setVisibleMonth(date);
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 'auto', lg: '600px' },
        minHeight: { lg: '600px' },
        display: 'flex',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        border: '1px solid',
        borderRadius: '24px',
        p: 2,
        borderColor: 'divider',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'secondary.light',
              color: 'primary.main',
            }}
          >
            <CalendarMonthOutlined fontSize="small" />
          </Box>

          <Typography
            variant='h6'
          >
            Календарь
          </Typography>
        </Stack>

        <IconButton
          aria-label="Открыть календарь"
          onClick={() => navigate(ROUTES.CALENDAR)}
        >
          <OpenInNewOutlined />
        </IconButton>
      </Stack>

      <Grid
        container
        spacing={2}
        sx={{
          flex: 1,
          minHeight: 0,
          alignItems: 'stretch',
        }}
      >
        <Grid
          size={{ xs: 12, md: 5, lg: 5 }}
          sx={{
            minHeight: 0,
            overflow: 'auto',
            '& > .MuiStack-root > .MuiBox-root': {
              border: 'none',
              bgcolor: 'transparent',
              borderRadius: 0,
              p: 0,
            },
          }}
        >
          <CalendarMonthPanel
            withLegend={false}
            isLoading={isLoading}
            daySlot={CalendarDay}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            onMonthChange={setVisibleMonth}
          />
        </Grid>

        <Grid
          size={{ xs: 12, md: 7, lg: 7 }}
          sx={{
            display: 'flex',
            height: { lg: '100%' },
            minHeight: { xs: 320, lg: 0 },

            '& > .MuiBox-root': {
              p: 0,
              minHeight: 0,
              border: 'none',
              height: '100%',
              borderRadius: 0,
              bgcolor: 'transparent',
            },
          }}
        >
          <CalendarTaskList
            events={events}
            withHeader={false}
            isLoading={isLoading}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
