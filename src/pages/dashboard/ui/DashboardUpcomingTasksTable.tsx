import { AssignmentOutlined, FilterNoneOutlined, } from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  TablePagination,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchAllTasks, taskKeys, useTasksQuery } from '@/entities';
import {
  countTasksByPostId,
  getDashboardPeriodRange,
  pickRepresentativeTasksByPost,
  toDashboardTasksQueryParams,
  useAuthStore,
  useMyTaskFilterStore,
} from '@/features';
import { useTaskTableColumnFilters } from '@/pages/my-tasks/model/utils/useTaskTableColumnFilters';
import { TaskItem } from '@/pages/my-tasks/ui/TaskItem';
import { TaskTable } from '@/pages/my-tasks/ui/TaskTable';
import { EmptyBlock, NSTooltip } from '@/shared';

import {
  DASHBOARD_TABLE_PAGE_SIZE,
  DASHBOARD_UPCOMING_VIEW_MODE_KEY,
  MOBILE_DASHBOARD_TABLE_PAGE_SIZE,
} from '../model/constants';

import {
  DashboardUpcomingCardsFilter,
  DashboardUpcomingCardsFilterToggle,
} from './DashboardUpcomingCardsFilter';
import { DashboardUpcomingViewModeToggle } from './DashboardUpcomingViewModeToggle';

import type { DashboardUpcomingViewMode } from '../model/types';
import type { TaskTableListState } from '@/pages/my-tasks/model/types/types';

type DashboardUpcomingTasksTableProps = {
  isCompany: boolean;
  onErrorChange?: (isError: boolean) => void;
};

const getInitialViewMode = (): DashboardUpcomingViewMode => {
  const saved = localStorage.getItem(DASHBOARD_UPCOMING_VIEW_MODE_KEY);
  return saved === 'grid' || saved === 'table' ? saved : 'table';
};

export const DashboardUpcomingTasksTable = ({
  isCompany,
  onErrorChange,
}: DashboardUpcomingTasksTableProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));
  const rowsPerPage = isMobile
    ? MOBILE_DASHBOARD_TABLE_PAGE_SIZE
    : DASHBOARD_TABLE_PAGE_SIZE;

  const { columnFilters, hasActiveFilters, resetFilters } =
    useTaskTableColumnFilters({ isCompany });

  const [viewMode, setViewMode] =
    useState<DashboardUpcomingViewMode>(getInitialViewMode);
  const [isCardsFilterOpen, setIsCardsFilterOpen] = useState(false);
  const [tableListState, setTableListState] = useState<TaskTableListState>({
    total: 0,
    isLoading: true,
    isError: false,
    isEmpty: true,
  });

  const isGridView = viewMode === 'grid';

  const hasActiveCardsFilters =
    columnFilters.taskId !== 'all' ||
    columnFilters.personId !== 'all' ||
    columnFilters.status.length > 0 ||
    columnFilters.urgentOnly;

  const handleResetCardsFilters = useCallback(() => {
    columnFilters.onTaskIdChange('all');
    columnFilters.onPersonIdChange('all');
    columnFilters.onStatusChange([]);
    columnFilters.onUrgentOnlyChange(false);
  }, [columnFilters]);
  const { isPrime } = useAuthStore();
  const onlyMyTasks = useMyTaskFilterStore(state => state.onlyMyTasks);
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId
  );
  const postId = useMyTaskFilterStore(state => state.postId);
  const executorId = useMyTaskFilterStore(state => state.executorId);
  const period = useMyTaskFilterStore(state => state.period);
  const groupByPost = useMyTaskFilterStore(state => state.groupByPost);
  const setGroupByPost = useMyTaskFilterStore(state => state.setGroupByPost);
  const periodRange = useMemo(
    () => getDashboardPeriodRange(period),
    [period]
  );

  const filterKey = useMemo(
    () =>
      [
        columnFilters.status,
        columnFilters.taskId,
        columnFilters.personId,
        columnFilters.urgentOnly,
        columnFilters.updatedDate,
        columnFilters.deadlineDate,
        onlyMyTasks,
        assigneeAccountId,
        postId,
        executorId,
        period,
        isCompany,
        rowsPerPage,
        viewMode,
        groupByPost,
      ].join('|'),
    [
      columnFilters.status,
      columnFilters.taskId,
      columnFilters.personId,
      columnFilters.urgentOnly,
      columnFilters.updatedDate,
      columnFilters.deadlineDate,
      onlyMyTasks,
      assigneeAccountId,
      postId,
      executorId,
      period,
      isCompany,
      rowsPerPage,
      viewMode,
      groupByPost,
    ]
  );

  const [gridPageState, setGridPageState] = useState({ filterKey, page: 0 });
  const gridPage =
    gridPageState.filterKey === filterKey ? gridPageState.page : 0;

  const gridFilterInput = useMemo(
    () => ({
      isCompany,
      ...(columnFilters.status.length > 0 && {
        status: columnFilters.status,
      }),
      ...(columnFilters.taskId !== 'all' && {
        taskId: columnFilters.taskId,
      }),
      ...(columnFilters.personId !== 'all' && {
        personId: columnFilters.personId,
      }),
      urgentOnly: columnFilters.urgentOnly,
      ...(columnFilters.updatedDate && {
        updatedDate: columnFilters.updatedDate,
      }),
      ...(columnFilters.deadlineDate && {
        deadlineDate: columnFilters.deadlineDate,
      }),
      onlyMyTasks,
      assigneeAccountId,
      postId,
      executorId,
      ...periodRange,
    }),
    [
      isCompany,
      columnFilters,
      onlyMyTasks,
      assigneeAccountId,
      postId,
      executorId,
      periodRange,
    ],
  );

  const pagedGridQueryParams = useMemo(() => {
    if (!isGridView || groupByPost) return undefined;

    return toDashboardTasksQueryParams(gridFilterInput, {
      page: gridPage + 1,
      limit: rowsPerPage,
    });
  }, [isGridView, groupByPost, gridFilterInput, gridPage, rowsPerPage]);

  const groupedGridQueryParams = useMemo(() => {
    if (!isGridView || !groupByPost) return undefined;

    const params = toDashboardTasksQueryParams(gridFilterInput, {
      page: 1,
      limit: 1,
    });

    return Object.fromEntries(
      Object.entries(params).filter(([key]) => key !== 'page' && key !== 'limit'),
    ) as Omit<typeof params, 'page' | 'limit'>;
  }, [isGridView, groupByPost, gridFilterInput]);

  const {
    data: pagedGridData,
    isLoading: isPagedGridLoading,
    isError: isPagedGridError,
  } = useTasksQuery(pagedGridQueryParams, {
    enabled: Boolean(pagedGridQueryParams),
  });

  const {
    data: allGridTasks,
    isLoading: isGroupedGridLoading,
    isError: isGroupedGridError,
  } = useQuery({
    queryKey: [...taskKeys.all, 'dashboard-upcoming-grouped', groupedGridQueryParams],
    queryFn: () => fetchAllTasks(groupedGridQueryParams),
    enabled: Boolean(groupedGridQueryParams),
  });

  const isGridLoading = groupByPost ? isGroupedGridLoading : isPagedGridLoading;
  const isGridError = groupByPost ? isGroupedGridError : isPagedGridError;

  const sourceTasks = useMemo(
    () => (groupByPost ? (allGridTasks ?? []) : (pagedGridData?.items ?? [])),
    [groupByPost, allGridTasks, pagedGridData?.items],
  );

  const groupedTasks = useMemo(
    () =>
      groupByPost ? pickRepresentativeTasksByPost(sourceTasks) : sourceTasks,
    [groupByPost, sourceTasks],
  );

  const gridDisplayTotal = groupByPost
    ? groupedTasks.length
    : (pagedGridData?.total ?? 0);

  const gridTasks = useMemo(() => {
    if (!groupByPost) return sourceTasks;

    const start = gridPage * rowsPerPage;
    return groupedTasks.slice(start, start + rowsPerPage);
  }, [groupByPost, sourceTasks, groupedTasks, gridPage, rowsPerPage]);

  const hasMultipleTasksForOnePost = useMemo(
    () => countTasksByPostId(sourceTasks),
    [sourceTasks],
  );

  const gridListState = useMemo<TaskTableListState>(
    () => ({
      total: gridDisplayTotal,
      isLoading: isGridLoading,
      isError: isGridError,
      isEmpty: !isGridLoading && gridTasks.length === 0,
    }),
    [gridDisplayTotal, isGridLoading, isGridError, gridTasks.length]
  );

  const listState = isGridView ? gridListState : tableListState;

  const handleListStateChange = useCallback((state: TaskTableListState) => {
    setTableListState(state);
  }, []);

  const handleViewModeChange = (value: DashboardUpcomingViewMode) => {
    localStorage.setItem(DASHBOARD_UPCOMING_VIEW_MODE_KEY, value);
    setViewMode(value);
    if (value !== 'grid') {
      setIsCardsFilterOpen(false);
    }
  };

  useEffect(() => {
    onErrorChange?.(listState.isError);
  }, [listState.isError, onErrorChange]);

  const emptyText =
    (isGridView ? hasActiveCardsFilters : hasActiveFilters)
      ? 'Нет задач по выбранным фильтрам'
      : 'Нет задач с дедлайном на сегодня и ожидающих вашего действия';

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        height: { xs: 'auto', lg: 600 },
        minHeight: { xs: 420, lg: 600 },
        display: 'flex',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        p: 2,
        borderRadius: '24px',
        border: '1px solid',
        borderColor: 'divider',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          justifyContent: 'space-between',
          alignItems: 'center',
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
              color: 'primary.main',
              justifyContent: 'center',
              bgcolor: 'secondary.light',
            }}
          >
            <AssignmentOutlined fontSize="small" />
          </Box>


          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
          >
            <Typography variant="h6">Текущие задачи</Typography>

            {!listState.isLoading &&
              !listState.isError &&
              listState.total > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={String(listState.total)}
                  sx={{ display: { xs: 'none', md: 'flex' } }}
                />
              )}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', flexShrink: 0 }}
        >
          {!isGridView && hasActiveFilters && (
            <Chip
              label="Сбросить"
              variant="outlined"
              onClick={resetFilters}
              sx={{ flexShrink: 0 }}
            />
          )}

          {isGridView && (
            <DashboardUpcomingCardsFilterToggle
              open={isCardsFilterOpen}
              hasActiveFilters={hasActiveCardsFilters}
              onClick={() => setIsCardsFilterOpen(prev => !prev)}
            />
          )}

          {isGridView && isPrime && (
            <NSTooltip title={groupByPost ? "Включить группировку по объявлениям" : "Выключить группировку по объявлениям"}>
              <IconButton
                size="small"
                aria-label="Сгруппировать по объявлениям"
                onClick={() => setGroupByPost(!groupByPost)}
                sx={{
                  color: groupByPost ? 'primary.main' : 'text.secondary',
                }}
              >
                <FilterNoneOutlined fontSize="small" />
              </IconButton>
            </NSTooltip>
          )}

          <DashboardUpcomingViewModeToggle
            viewMode={viewMode}
            onChange={handleViewModeChange}
          />
        </Stack>
      </Stack>

      {isGridView && (
        <DashboardUpcomingCardsFilter
          open={isCardsFilterOpen}
          isCompany={isCompany}
          taskId={columnFilters.taskId}
          personId={columnFilters.personId}
          status={columnFilters.status}
          urgentOnly={columnFilters.urgentOnly}
          onTaskIdChange={columnFilters.onTaskIdChange}
          onPersonIdChange={columnFilters.onPersonIdChange}
          onStatusChange={columnFilters.onStatusChange}
          onUrgentOnlyChange={columnFilters.onUrgentOnlyChange}
          onReset={handleResetCardsFilters}
        />
      )}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          ...(isGridView
            ? {}
            : {
              '& .MuiTable-root': {
                minWidth: 720,
              },
            }),
        }}
      >
        {isGridView ? (
          <>
            {isGridLoading && (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 6,
                }}
              >
                <CircularProgress />
              </Box>
            )}

            {!isGridLoading && listState.isEmpty && (
              <Stack
                sx={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EmptyBlock
                  title={emptyText}
                  description={emptyText}
                />
              </Stack>
            )}

            {!isGridLoading && !listState.isEmpty && (
              <>
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'auto',
                    pr: 0.5,
                    scrollbarWidth: 'none',
                  }}
                >
                  <Grid
                    container
                    spacing={1}
                    sx={{ width: '100%' }}
                  >
                    {gridTasks.map(task => (
                      <Grid
                        key={task.id}
                        size={{ xs: 12, sm: 6 }}
                      >
                        <TaskItem
                          compact
                          task={task}
                          isCompany={isCompany}
                          groupByPost={groupByPost}
                          multipleTasks={Math.max(
                            0,
                            (task.postId
                              ? (hasMultipleTasksForOnePost.get(task.postId) ??
                                0)
                              : 0) - 1,
                          )}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {gridDisplayTotal > rowsPerPage && (
                  <TablePagination
                    component="div"
                    count={gridDisplayTotal}
                    page={gridPage}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[rowsPerPage]}
                    onPageChange={(_, page) =>
                      setGridPageState({ filterKey, page })
                    }
                    labelDisplayedRows={({ from, to, count }) =>
                      `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`
                    }
                    sx={{
                      flexShrink: 0,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                      '.MuiTablePagination-toolbar': {
                        minHeight: 48,
                        px: 0,
                      },
                    }}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <TaskTable
            embedded
            querySource="dashboard"
            isCompany={isCompany}
            emptyText={emptyText}
            onListStateChange={handleListStateChange}
            rowsPerPage={rowsPerPage}
            columnFilters={columnFilters}
          />
        )}
      </Box>
    </Box>
  );
};
