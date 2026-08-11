import { Add } from '@mui/icons-material';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  TASK_STATUS_ENUM,
  USER_ROLE,
  toDashboardTileVariant,
  useTaskStatsQuery,
  useUserConfigQuery,
} from '@/entities';
import {
  getDashboardCardOptions,
  getDashboardPeriodRange,
  getFastButtonLabel,
  useAuthStore,
  useMyTaskFilterStore,
  type DashboardCardVariant,
  type FastButtonValueType,
} from '@/features';
import { EmptyBlock, ROUTES, } from '@/shared';
import { ConfirmDialog, PageLayout } from '@/widgets';

import { DASHBOARD_SETTINGS_TIP_SEEN_KEY } from '../model/constants';
import { getDashboardCardCount } from '../model/utils';

import { DashboardActivityPanel } from './DashboardActivityPanel';
import { DashboardCalendarPanel } from './DashboardCalendarPanel';
import { DashboardCard } from './DashboardCard';
import { DashboardChatsPanel } from './DashboardChatsPanel';
import { DashboardCommentsPanel } from './DashboardCommentsPanel';
import { DashboardFiltersBar } from './DashboardFiltersBar';
import { DashboardUpcomingTasksTable } from './DashboardUpcomingTasksTable';

import type { MyTasksLocationState } from '@/pages/my-tasks/model/types/navigation';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { role, isAuth } = useAuthStore();
  const [isUpcomingTasksError, setIsUpcomingTasksError] = useState(false);
  const [isSettingsTipOpen, setIsSettingsTipOpen] = useState(false);
  const setFastButtonValue = useMyTaskFilterStore(
    state => state.setFastButtonValue
  );
  const setStatus = useMyTaskFilterStore(state => state.setStatus);
  const viewMode = useMyTaskFilterStore(state => state.viewMode);
  const onlyMyTasks = useMyTaskFilterStore(state => state.onlyMyTasks);
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId
  );
  const postId = useMyTaskFilterStore(state => state.postId);
  const executorId = useMyTaskFilterStore(state => state.executorId);
  const period = useMyTaskFilterStore(state => state.period);
  const ensureKanbanColumnVisible = useMyTaskFilterStore(
    state => state.ensureKanbanColumnVisible
  );
  const isCompany = role === USER_ROLE.COMPANY;

  const periodRange = useMemo(
    () => getDashboardPeriodRange(period),
    [period]
  );

  const { data: userConfig } = useUserConfigQuery({ enabled: isAuth });

  const roleCardOptions = useMemo(
    () => getDashboardCardOptions(isCompany),
    [isCompany]
  );

  const cardOptions = useMemo(() => {
    const allowed = new Set<string>(roleCardOptions);

    if (!userConfig?.dashboardTiles) {
      return roleCardOptions;
    }

    return userConfig.dashboardTiles
      .map(toDashboardTileVariant)
      .filter((variant): variant is DashboardCardVariant =>
        allowed.has(variant)
      );
  }, [roleCardOptions, userConfig]);

  const showTasks = userConfig?.dashboardShowTasks ?? true;
  const showChats = userConfig?.dashboardShowChats ?? true;
  const showActivity = userConfig?.dashboardShowActivity ?? true;
  const showComments = userConfig?.dashboardShowComments ?? true;
  const showCalendar = userConfig?.dashboardShowCalendar ?? true;

  useEffect(() => {
    if (!isAuth) return;
    if (localStorage.getItem(DASHBOARD_SETTINGS_TIP_SEEN_KEY)) return;

    setTimeout(() => {
      setIsSettingsTipOpen(true);
    }, 0);
  }, [isAuth]);

  const markSettingsTipSeen = () => {
    localStorage.setItem(DASHBOARD_SETTINGS_TIP_SEEN_KEY, 'true');
    setIsSettingsTipOpen(false);
  };

  const handleOpenDashboardSettings = () => {
    markSettingsTipSeen();
    navigate(ROUTES.SETTINGS_CRM);
  };

  const hasWidgets = [
    showTasks,
    showChats,
    showActivity,
    showComments,
    showCalendar,
  ].some(Boolean);

  const everyWidgetIsActive = [
    showTasks,
    showChats,
    showActivity,
    showComments,
    showCalendar,
  ].every(Boolean);

  /** Пары main(8) + side(4); сайдбары без пары и комментарии — до 6 */
  const { tasksSide, calendarSide } = useMemo(() => {
    // Ровно один сайдбар: парим с первым доступным main (tasks → calendar)
    if (showActivity !== showChats) {
      const side = showActivity ? ('activity' as const) : ('chats' as const);

      if (showTasks) {
        return { tasksSide: side, calendarSide: null };
      }

      if (showCalendar) {
        return { tasksSide: null, calendarSide: side };
      }

      return { tasksSide: null, calendarSide: null };
    }

    // Оба сайдбара: tasks|chats, calendar|activity
    if (showActivity && showChats) {
      return {
        tasksSide: showTasks ? ('chats' as const) : null,
        calendarSide: showCalendar
          ? showTasks
            ? ('activity' as const)
            : ('chats' as const)
          : null,
      };
    }

    return { tasksSide: null, calendarSide: null };
  }, [showTasks, showCalendar, showActivity, showChats]);

  const activityPlaced =
    tasksSide === 'activity' || calendarSide === 'activity';
  const chatsPlaced = tasksSide === 'chats' || calendarSide === 'chats';

  const mainSize = (hasSide: boolean) => (hasSide ? 8 : 12);
  const sidePairedSize = 4;
  const sideSoloSize = 6;

  const {
    data: stats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
  } = useTaskStatsQuery({
    ...(onlyMyTasks && { assigneeMine: true }),
    ...(assigneeAccountId !== 'all' &&
      !onlyMyTasks && { assigneeAccountId }),
    ...(postId !== 'all' && { postId }),
    ...(executorId !== 'all' &&
      (isCompany ? { executorId } : { ownerId: executorId })),
    ...periodRange,
  });

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
            buttonOnClick={handleRefetch}
            title="Не удалось загрузить данные дашборда"
          />
        </Box>
      )}

      <DashboardFiltersBar isCompany={isCompany} />

      {cardOptions.length > 0 && (
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
              size={{ xs: 6, md: 4 }}
            >
              <DashboardCard
                variant={value}
                label={getFastButtonLabel(value)}
                onClick={() => handleCardClick(value)}
                count={getDashboardCardCount(value, stats)}
                isLoading={isStatsLoading || isStatsError}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {hasWidgets && (
        <Grid
          container
          spacing={1}
        >
          {showTasks && (
            <Grid
              size={{
                xs: 12,
                lg: mainSize(Boolean(tasksSide)),
              }}
              sx={{ display: 'flex', minWidth: 0 }}
            >
              <DashboardUpcomingTasksTable
                isCompany={isCompany}
                onErrorChange={handleUpcomingTasksErrorChange}
              />
            </Grid>
          )}

          {tasksSide === 'activity' && (
            <Grid
              size={{ xs: 12, lg: sidePairedSize }}
              sx={{ display: 'flex' }}
            >
              <DashboardActivityPanel />
            </Grid>
          )}

          {tasksSide === 'chats' && (
            <Grid
              size={{ xs: 12, lg: sidePairedSize }}
              sx={{ display: 'flex' }}
            >
              <DashboardChatsPanel />
            </Grid>
          )}

          {showCalendar && (
            <Grid
              size={{
                xs: 12,
                lg: mainSize(Boolean(calendarSide)),
              }}
              sx={{ display: 'flex' }}
            >
              <DashboardCalendarPanel />
            </Grid>
          )}

          {calendarSide === 'activity' && (
            <Grid
              size={{ xs: 12, lg: sidePairedSize }}
              sx={{ display: 'flex' }}
            >
              <DashboardActivityPanel />
            </Grid>
          )}

          {calendarSide === 'chats' && (
            <Grid
              size={{ xs: 12, lg: sidePairedSize }}
              sx={{ display: 'flex' }}
            >
              <DashboardChatsPanel />
            </Grid>
          )}

          {showActivity && !activityPlaced && (
            <Grid
              size={{ xs: 12, lg: sideSoloSize }}
              sx={{ display: 'flex' }}
            >
              <DashboardActivityPanel />
            </Grid>
          )}

          {showChats && !chatsPlaced && (
            <Grid
              size={{ xs: 12, lg: sideSoloSize }}
              sx={{ display: 'flex' }}
            >
              <DashboardChatsPanel />
            </Grid>
          )}

          {showComments && (
            <Grid
              size={{
                xs: 12,
                lg: showCalendar && showTasks ? 12 : sideSoloSize,
              }}
              sx={{ display: 'flex' }}
            >
              <DashboardCommentsPanel />
            </Grid>
          )}
        </Grid>
      )}

      {!everyWidgetIsActive && (
        <Button
          variant="outlined"
          onClick={() => navigate(ROUTES.SETTINGS_CRM)}
          endIcon={<Add />}
          sx={{ width: 'fit-content', mt: 1, mr: 2, alignSelf: 'end' }}
        >
          Добавить виджет
        </Button>
      )}

      <ConfirmDialog
        withButtons={false}
        isOpen={isSettingsTipOpen}
        onClose={markSettingsTipSeen}
      >
        <Typography variant="h6">Настройте дашборд под себя</Typography>
        <Typography
          variant="body1"
          sx={{ mt: 2 }}
        >
          Можно выбрать виджеты и карточки задач в настройках CRM — так на
          экране останется только нужное.
        </Typography>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4 }}
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={markSettingsTipSeen}
          >
            Понятно
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenDashboardSettings}
          >
            Перейти в настройки
          </Button>
        </Stack>
      </ConfirmDialog>
    </PageLayout>
  );
};

export default DashboardPage;
