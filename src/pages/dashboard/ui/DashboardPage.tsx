import { Box, Grid } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { TASK_STATUS_ENUM, USER_ROLE, useTaskStatsQuery } from '@/entities';
import {
  getDashboardCardOptions,
  getFastButtonLabel,
  useAuthStore,
  useMyTaskFilterStore,
  type FastButtonValueType,
} from '@/features';
import { EmptyBlock, ROUTES } from '@/shared';
import { PageLayout } from '@/widgets';

import { getDashboardCardCount } from '../model/utils';

import { DashboardActivityPanel } from './DashboardActivityPanel';
import { DashboardCard } from './DashboardCard';
import { DashboardCommentsPanel } from './DashboardCommentsPanel';
import { DashboardUpcomingTasksTable } from './DashboardUpcomingTasksTable';

import type { MyTasksLocationState } from '@/pages/my-tasks/model/navigation';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const [isUpcomingTasksError, setIsUpcomingTasksError] = useState(false);
  const setFastButtonValue = useMyTaskFilterStore(
    state => state.setFastButtonValue
  );
  const setStatus = useMyTaskFilterStore(state => state.setStatus);
  const viewMode = useMyTaskFilterStore(state => state.viewMode);
  const ensureKanbanColumnVisible = useMyTaskFilterStore(
    state => state.ensureKanbanColumnVisible,
  );
  const isCompany = role === USER_ROLE.COMPANY;

  const cardOptions = useMemo(
    () => getDashboardCardOptions(isCompany),
    [isCompany]
  );

  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
  } = useTaskStatsQuery();

  const handleUpcomingTasksErrorChange = useCallback((isError: boolean) => {
    setIsUpcomingTasksError(isError);
  }, []);

  const handleRefetch = () => {
    void refetchStats();
  };

  const handleCardClick = (value: FastButtonValueType) => {
    if (value === 'checking' && viewMode === 'kanban') {
      setFastButtonValue(null);
      ensureKanbanColumnVisible(TASK_STATUS_ENUM.CHECKING);
      navigate(ROUTES.MY_TASKS, {
        state: {
          fromDashboard: true,
          scrollToKanbanColumn: TASK_STATUS_ENUM.CHECKING,
        } satisfies MyTasksLocationState,
      });
      return;
    }

    if (value === 'checking') {
      setFastButtonValue(null);
      setStatus(TASK_STATUS_ENUM.CHECKING);
    } else {
      setFastButtonValue(value);
    }

    navigate(ROUTES.MY_TASKS, { state: { fromDashboard: true } });
  };

  const isPageError = isStatsError || isUpcomingTasksError;

  return (
    <PageLayout>
      {isPageError && (
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
            title="Не удалось загрузить данные дашборда"
            buttonOnClick={handleRefetch}
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
        {cardOptions.map(value => (
          <Grid
            key={value}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <DashboardCard
              variant={value}
              count={getDashboardCardCount(value, stats)}
              isLoading={isStatsLoading || isStatsError}
              label={getFastButtonLabel(value)}
              onClick={() => handleCardClick(value)}
            />
          </Grid>
        ))}
      </Grid>

      <Grid
        container
        spacing={1}
      >
        <Grid
          size={{ xs: 12, lg: 8 }}
          sx={{ display: 'flex' }}
        >
          <DashboardUpcomingTasksTable
            isCompany={isCompany}
            onErrorChange={handleUpcomingTasksErrorChange}
          />
        </Grid>

        <Grid
          size={{ xs: 12, lg: 4 }}
          sx={{ display: 'flex' }}
        >
          <DashboardActivityPanel />
        </Grid>

        <Grid size={{ xs: 12 }}>
          <DashboardCommentsPanel />
        </Grid>
      </Grid>
    </PageLayout>
  );
};

export default DashboardPage;
