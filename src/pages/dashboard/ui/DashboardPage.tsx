import { Box, Grid } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { TASK_STATUS_ENUM, USER_ROLE, useAllTasksQuery } from '@/entities';
import { useAuthStore } from '@/features';
import {
  DASHBOARD_FAST_BUTTON_OPTIONS,
  filterTasksByExecutorApprove,
  getFastButtonLabel,
  useMyTaskFilterStore,
  type FastButtonValueType,
} from '@/features';
import { EmptyBlock, ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import {
  DASHBOARD_METRIC_CARD_LABELS,
  DASHBOARD_METRIC_CARD_OPTIONS,
  type DashboardMetricCardVariant,
} from '../model/types';
import {
  getCheckingTasks,
  getNearestDeadlineTasks,
  getOverdueTasks,
  getUrgentTasks,
} from '../model/utils';

import { DashboardActivityPanel } from './DashboardActivityPanel';
import { DashboardCard } from './DashboardCard';
import { DashboardCommentsPanel } from './DashboardCommentsPanel';
import { DashboardUpcomingTasksTable } from './DashboardUpcomingTasksTable';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const setFastButtonValue = useMyTaskFilterStore(
    state => state.setFastButtonValue
  );
  const setStatus = useMyTaskFilterStore(state => state.setStatus);
  const setViewMode = useMyTaskFilterStore(state => state.setViewMode);
  const setExtraFilter = useMyTaskFilterStore(state => state.setExtraFilter);
  const isCompany = role === USER_ROLE.COMPANY;

  const { data: tasks = [], isLoading, isError, refetch } = useAllTasksQuery();

  const fastCounts = useMemo(
    () =>
      Object.fromEntries(
        DASHBOARD_FAST_BUTTON_OPTIONS.map(value => [
          value,
          filterTasksByExecutorApprove(tasks, value, isCompany).length,
        ])
      ) as Record<FastButtonValueType, number>,
    [tasks, isCompany]
  );

  const metricCounts = useMemo(
    () => ({
      overdue: getOverdueTasks(tasks).length,
      urgent: getUrgentTasks(tasks).length,
      checking: getCheckingTasks(tasks).length,
    }),
    [tasks]
  );

  const nearestTasks = useMemo(
    () => getNearestDeadlineTasks(tasks, isCompany),
    [tasks, isCompany]
  );

  const handleFastCardClick = (value: FastButtonValueType) => {
    setExtraFilter(null);
    setFastButtonValue(value);
    navigate(ROUTES.MY_TASKS);
  };

  const handleMetricCardClick = (variant: DashboardMetricCardVariant) => {
    setViewMode('grid');

    if (variant === 'checking') {
      setExtraFilter(null);
      setStatus(TASK_STATUS_ENUM.CHECKING);
      navigate(ROUTES.MY_TASKS);
      return;
    }

    if (variant === 'overdue' || variant === 'urgent') {
      setExtraFilter(variant);
      navigate(ROUTES.MY_TASKS);
    }
  };

  return (
    <PageLayout
      title="Дашборд"
      withFooter={false}
    >
      {isError && (
        <Box
          sx={{
            py: 4,
            display: 'flex',
            bgcolor: 'white',
            border: '1px solid',
            borderRadius: '32px',
            borderColor: 'divider',
            justifyContent: 'center',
          }}
        >
          <EmptyBlock
            buttonText="Повторить"
            title="Не удалось загрузить задачи"
            buttonOnClick={() => void refetch()}
          />
        </Box>
      )}

      <Grid
        container
        spacing={1}
        sx={{
          mb: 1,
        }}
      >
        {DASHBOARD_FAST_BUTTON_OPTIONS.map(value => (
          <Grid
            key={value}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <DashboardCard
              variant={value}
              count={fastCounts[value]}
              isLoading={isLoading || isError}
              label={getFastButtonLabel(value)}
              onClick={() => handleFastCardClick(value)}
            />
          </Grid>
        ))}

        {DASHBOARD_METRIC_CARD_OPTIONS.map(value => (
          <Grid
            key={value}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <DashboardCard
              variant={value}
              count={metricCounts[value]}
              isLoading={isLoading || isError}
              label={DASHBOARD_METRIC_CARD_LABELS[value]}
              onClick={() => handleMetricCardClick(value)}
            />
          </Grid>
        ))}
      </Grid>

      <Grid
        container
        spacing={1}
      >
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardUpcomingTasksTable
            tasks={nearestTasks}
            isLoading={isLoading || isError}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardActivityPanel tasks={tasks} />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DashboardCommentsPanel tasks={tasks} />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default DashboardPage;
