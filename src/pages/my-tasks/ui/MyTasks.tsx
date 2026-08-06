import { CallMade } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import {
  USER_ROLE,
  useTasksInfiniteQuery,
  useTasksQuery,
  type Task,
  type TaskStatus,
} from '@/entities';
import { useAuthStore } from '@/features';
import {
  useMyTaskFilterStore,
  toMyTasksQueryParams,
  MyTaskFilter,
  AddTaskDialog,
} from '@/features';
import { EmptyBlock, ROUTES } from '@/shared';
import { ConfirmDialog, PageLayout } from '@/widgets';

import { TASK_TABLE_PAGE_SIZE } from '../model/constants/constants';
import { exportTasksReport } from '../model/utils/exportTasksReport';
import { fetchTasksForReport } from '../model/utils/fetchTasksForReport';
import { useTaskTableColumnFilters } from '../model/utils/useTaskTableColumnFilters';

import { KanbanBoard, type KanbanBoardHandle } from './KanbanBoard';
import { TaskItem } from './TaskItem';
import { TasksLoadMoreButton } from './TasksLoadMoreButton';
import { TasksPrintHeader } from './TasksPrintHeader';
import { TaskTable } from './TaskTable';

import type { MyTasksLocationState } from '../model/types/navigation';

type InitialPost = {
  id?: string;
  title?: string;
};

export const MyTasks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingDashboardNavRef = useRef(false);
  const pendingKanbanScrollRef = useRef<TaskStatus | null>(null);
  const kanbanBoardRef = useRef<KanbanBoardHandle>(null);
  const [initialPosts, setInitialPosts] = useState<InitialPost[]>([]);
  const [isOpenPrimeRecommendation, setIsOpenPrimeRecommendation] =
    useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [reportTasks, setReportTasks] = useState<Task[] | null>(null);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const { role, isPrime } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;

  const {
    status,
    postId,
    executorId,
    viewMode,
    updatedDate,
    extraFilter,
    onlyMyTasks,
    assigneeAccountId,
    setViewMode,
    setExecutorId,
    setStatus,
    setUpdatedDate,
    setExtraFilter,
    setFastButtonValue,
    setPostId,
    setOnlyMyTasks,
    setAssigneeAccountId,
    setIsSearchOpen,
    setSearchQuery,
    fastButtonValue,
    toggleKanbanColumn,
    visibleKanbanColumns,
    isSearchOpen,
    searchQuery,
  } = useMyTaskFilterStore();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearchOpen) {
      setTimeout(() => {
        setDebouncedQuery('');
      }, 0);
    }
  }, [isSearchOpen]);

  const searchQ =
    isSearchOpen && debouncedQuery.length >= 2 ? debouncedQuery : undefined;

  const executorIdFromUrl = useMemo(() => {
    const value = new URLSearchParams(location.search).get('executorId');

    if (
      !value ||
      value === 'all' ||
      value === 'undefined' ||
      value === 'null'
    ) {
      return null;
    }

    return value;
  }, [location.search]);

  const handleUrgentOnlyChange = useCallback(
    (value: boolean) => setExtraFilter(value ? 'urgent' : null),
    [setExtraFilter],
  );

  const {
    columnFilters,
    taskId: taskIdFilter,
    deadlineDate: deadlineDateFilter,
    hasActiveFilters: hasActiveColumnFilters,
    resetFilters: resetColumnFilters,
  } = useTaskTableColumnFilters({
    isCompany,
    status: { value: status, onChange: setStatus },
    personId: {
      value: executorIdFromUrl ?? executorId,
      onChange: setExecutorId,
    },
    urgentOnly: {
      value: extraFilter === 'urgent',
      onChange: handleUrgentOnlyChange,
    },
    updatedDate: { value: updatedDate, onChange: setUpdatedDate },
  });

  useEffect(() => {
    if (executorIdFromUrl) {
      setExecutorId(executorIdFromUrl);
      setFastButtonValue(null);
      pendingDashboardNavRef.current = true;
      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    const state = location.state as MyTasksLocationState | null;
    const fromDashboard = Boolean(
      state?.fromDashboard || state?.skipDefaultFastFilter,
    );

    if (fromDashboard) {
      pendingDashboardNavRef.current = true;

      if (state?.scrollToKanbanColumn) {
        pendingKanbanScrollRef.current = state.scrollToKanbanColumn;
      }

      navigate(location.pathname, { replace: true, state: null });
      return;
    }

    if (pendingDashboardNavRef.current) {
      pendingDashboardNavRef.current = false;
    }
  }, [
    executorIdFromUrl,
    location.key,
    location.pathname,
    location.state,
    navigate,
    setExecutorId,
    setFastButtonValue,
  ]);

  const queryFilters = useMemo(
    () => ({
      postId,
      executorId: executorIdFromUrl ?? executorId,
      status,
      viewMode,
      updatedDate,
      extraFilter,
      onlyMyTasks,
      assigneeAccountId,
      fastButtonValue: executorIdFromUrl ? null : fastButtonValue,
      isCompany,
      q: searchQ,
      taskId: taskIdFilter,
      deadlineDate: deadlineDateFilter,
    }),
    [
      postId,
      executorIdFromUrl,
      executorId,
      status,
      viewMode,
      updatedDate,
      extraFilter,
      onlyMyTasks,
      assigneeAccountId,
      fastButtonValue,
      isCompany,
      searchQ,
      taskIdFilter,
      deadlineDateFilter,
    ],
  );

  const baseParams = useMemo(
    () => toMyTasksQueryParams(queryFilters),
    [queryFilters],
  );

  const [tablePageState, setTablePageState] = useState({
    filterKey: '',
    page: 0,
  });

  const paginationResetKey = useMemo(
    () =>
      [
        viewMode,
        status,
        postId,
        executorId,
        fastButtonValue,
        extraFilter ?? '',
        updatedDate ?? '',
        searchQ ?? '',
        taskIdFilter,
        deadlineDateFilter ?? '',
      ].join('|'),
    [
      viewMode,
      status,
      postId,
      executorId,
      fastButtonValue,
      extraFilter,
      updatedDate,
      searchQ,
      taskIdFilter,
      deadlineDateFilter,
    ],
  );

  const tablePage =
    tablePageState.filterKey === paginationResetKey ? tablePageState.page : 0;

  const isTableView = viewMode === 'table';

  const tableQueryParams = useMemo(
    () => ({
      ...baseParams,
      page: tablePage + 1,
      limit: TASK_TABLE_PAGE_SIZE,
    }),
    [baseParams, tablePage],
  );

  const {
    data: tableData,
    isLoading: isTableLoading,
  } = useTasksQuery(tableQueryParams, { enabled: isTableView });

  const listQueryParams = useMemo(
    () => ({ ...baseParams, limit: TASK_TABLE_PAGE_SIZE }),
    [baseParams],
  );

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTasksInfiniteQuery(baseParams, {
    enabled: !isTableView,
    limit: TASK_TABLE_PAGE_SIZE,
  });

  const listTasks = useMemo(
    () => infiniteData?.pages.flatMap(page => page.items) ?? [],
    [infiniteData?.pages],
  );

  const filteredTasks = isTableView ? (tableData?.items ?? []) : listTasks;
  const totalTasks = isTableView ? tableData?.total : infiniteData?.pages[0]?.total;

  const contentRef = useRef<HTMLDivElement>(null);

  const handleTablePageChange = (_: unknown, nextPage: number) => {
    setTablePageState({ filterKey: paginationResetKey, page: nextPage });
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isLoading = isTableView ? isTableLoading : isInfiniteLoading;

  const hasMultipleTasksForOnePost = listTasks.some(
    task => task.postId === listTasks[0]?.postId,
  );

  useEffect(() => {
    if (isPrime) return;
    if (localStorage.getItem('prime-recommendation-closed')) return;

    if (hasMultipleTasksForOnePost) {
      setTimeout(() => {
        setIsOpenPrimeRecommendation(true);
      }, 0);
    }
  }, [hasMultipleTasksForOnePost, isPrime]);

  useEffect(() => {
    if (listTasks.length && !initialPosts?.length) {
      const preparedTasks = listTasks.map(task => ({
        id: task?.post?.id,
        title: task.post?.title,
      }));

      const uniqueTasks = preparedTasks.filter(
        (task, index, self) => index === self.findIndex(t => t.id === task.id),
      );

      setTimeout(() => {
        setInitialPosts(uniqueTasks);
      }, 0);
    }
  }, [initialPosts?.length, listTasks]);

  const handleClosePrimeRecommendation = () => {
    setIsOpenPrimeRecommendation(false);
    localStorage.setItem('prime-recommendation-closed', 'true');
  };

  const isFullHeightView = viewMode === 'kanban' || viewMode === 'table';
  const isEmpty = !isLoading && !filteredTasks.length;
  const hasActiveFilters =
    hasActiveColumnFilters ||
    postId !== 'all' ||
    Boolean(fastButtonValue) ||
    Boolean(searchQ) ||
    onlyMyTasks ||
    assigneeAccountId !== 'all';
  const showFilter = Boolean(
    !isEmpty || hasActiveFilters || isSearchOpen,
  );
  const tableReportDisabled = isLoading || isEmpty;

  const handleResetFilters = useCallback(() => {
    resetColumnFilters();
    setPostId('all');
    setFastButtonValue(null);
    setOnlyMyTasks(false);
    setAssigneeAccountId('all');
    setSearchQuery('');
    setIsSearchOpen(false);
  }, [
    resetColumnFilters,
    setPostId,
    setFastButtonValue,
    setOnlyMyTasks,
    setAssigneeAccountId,
    setSearchQuery,
    setIsSearchOpen,
  ]);

  useEffect(() => {
    const column = pendingKanbanScrollRef.current;

    if (!column || viewMode !== 'kanban' || isLoading || isEmpty) return;

    const frameId = requestAnimationFrame(() => {
      if (!kanbanBoardRef.current) return;

      kanbanBoardRef.current.scrollToColumn(column);
      pendingKanbanScrollRef.current = null;
    });

    return () => cancelAnimationFrame(frameId);
  }, [viewMode, isLoading, isEmpty, visibleKanbanColumns, paginationResetKey]);

  const reportOptions = useMemo(
    () => ({
      postId,
      executorId,
      viewMode,
      status,
      updatedDate,
      fastButtonValue,
      extraFilter,
      onlyMyTasks,
      assigneeAccountId,
      isCompany,
      q: searchQ,
      taskId: taskIdFilter,
      deadlineDate: deadlineDateFilter,
    }),
    [
      postId,
      executorId,
      viewMode,
      status,
      updatedDate,
      fastButtonValue,
      extraFilter,
      onlyMyTasks,
      assigneeAccountId,
      isCompany,
      searchQ,
      taskIdFilter,
      deadlineDateFilter,
    ],
  );

  const printTasks = reportTasks ?? filteredTasks;

  const gridHiddenCount = hasNextPage
    ? Math.max((totalTasks ?? 0) - filteredTasks.length, 0)
    : 0;

  useEffect(() => {
    if (!pendingPrint || viewMode !== 'table' || !reportTasks) return;

    let cancelled = false;
    let innerFrameId = 0;

    const outerFrameId = requestAnimationFrame(() => {
      innerFrameId = requestAnimationFrame(() => {
        if (cancelled) return;

        const handleAfterPrint = () => {
          setPendingPrint(false);
          setReportTasks(null);
        };

        window.addEventListener('afterprint', handleAfterPrint, { once: true });
        window.print();
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerFrameId);
      cancelAnimationFrame(innerFrameId);
    };
  }, [pendingPrint, viewMode, reportTasks]);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      const tasks = await fetchTasksForReport(reportOptions);

      setReportTasks(tasks);
      setViewMode('table');
      setPendingPrint(true);
    } catch (error) {
      console.error('Failed to prepare tasks report for print', error);
    } finally {
      setIsPrinting(false);
    }
  }, [reportOptions, setViewMode]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const tasks = await fetchTasksForReport(reportOptions);

      exportTasksReport(tasks);
    } catch (error) {
      console.error('Failed to export tasks report', error);
    } finally {
      setIsExporting(false);
    }
  }, [reportOptions]);

  const tableReport = useMemo(
    () => ({
      disabled: tableReportDisabled,
      isExporting,
      isPrinting,
      onPrint: handlePrint,
      onExport: handleExport,
    }),
    [handleExport, handlePrint, isExporting, isPrinting, tableReportDisabled],
  );

  return (
    <PageLayout
      withFooter={false}
      isScreenHeight={isFullHeightView}
      printHide={viewMode === 'table'}
    >
      <Box
        className={viewMode === 'table' ? 'print-root' : undefined}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          mb: viewMode === 'grid' ? 1 : 0,
          flex: 1,
          position: 'relative',
          ...(isFullHeightView && {
            flex: 1,
            minHeight: 0,
            height: '100%',
          }),
          '@media print': {
            height: 'auto',
            minHeight: 'auto',
            overflow: 'visible',
            flex: 'none',
          },
        }}
      >
        {showFilter && (
          <Box
            sx={{
              top: 0,
              zIndex: isContentExpanded ? 0 : 1000,
              flexShrink: 0,
              position: 'sticky',
            }}
          >
            <MyTaskFilter
              tableReport={tableReport}
              initialPosts={initialPosts}
              isCompany={isCompany}
            />
          </Box>
        )}

        {isEmpty && (
          <Box
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              bgcolor: 'white',
              border: '1px solid',
              borderRadius: '32px',
              borderColor: 'divider',
              justifyContent: 'center',
            }}
          >
            <EmptyBlock
              title={
                searchQ
                  ? 'Ничего не найдено'
                  : hasActiveFilters
                    ? 'По выбранным фильтрам ничего не найдено'
                    : 'У вас пока нет задач'
              }
              description={
                searchQ
                  ? 'Попробуйте изменить запрос'
                  : hasActiveFilters
                    ? 'Попробуйте изменить фильтры или сбросить их'
                    : undefined
              }
              {...(hasActiveFilters
                ? {
                    buttonText: 'Сбросить фильтры',
                    buttonOnClick: handleResetFilters,
                  }
                : isCompany
                  ? {
                      buttonText: 'Создать задачу',
                      buttonOnClick: () => setIsAddTaskOpen(true),
                    }
                  : {})}
            />
          </Box>
        )}

        {!isEmpty && !isLoading && (
          <Box
            sx={{
              gap: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '32px',
              ...(isFullHeightView && {
                flex: 1,
                minHeight: 0,
              }),
            }}
          >
            <Box
              ref={contentRef}
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                position: isContentExpanded ? 'absolute' : 'relative',
                top: isContentExpanded ? 0 : undefined,
                left: isContentExpanded ? 0 : undefined,
                right: isContentExpanded ? 0 : undefined,
                bottom: isContentExpanded ? 0 : undefined,
                zIndex: isContentExpanded ? 1000 : undefined,
                ...(viewMode !== 'kanban' && {
                  bgcolor: 'white',
                  borderRadius: { xs: '16px', md: '32px' },
                  p: { xs: 1.5, md: 2 },
                }),
                ...(isFullHeightView
                  ? {
                    flex: 1,
                    minHeight: 0,
                  }
                  : {}),
                ...(isContentExpanded && {
                  overflow: 'auto',
                }),
              }}
            >
              <Tooltip title={isContentExpanded ? 'Свернуть область задач' : 'Развернуть область задач'}>
                <IconButton
                  className="print-no-print"
                  size="small"
                  aria-label={
                    isContentExpanded
                      ? 'Свернуть область задач'
                      : 'Развернуть область задач'
                  }
                  onClick={() => setIsContentExpanded(prev => !prev)}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1000,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: 1,
                  }}
                >
                  <CallMade
                    fontSize="small"
                    sx={{
                      transform: isContentExpanded
                        ? 'rotate(90deg)'
                        : 'rotate(270deg)',
                    }}
                  />
                </IconButton>
              </Tooltip>

              {viewMode === 'grid' && (
                <>
                  <Grid
                    container
                    spacing={1}
                    sx={{ width: '100%' }}
                  >
                    {filteredTasks.map(task => (
                      <Grid
                        key={task.id}
                        size={{ xs: 12, sm: 6, md: 4 }}
                      >
                        <TaskItem
                          task={task}
                          isCompany={isCompany}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {hasNextPage && (
                    <Box sx={{ mt: 1 }}>
                      <TasksLoadMoreButton
                        hiddenCount={gridHiddenCount}
                        onClick={() => void fetchNextPage()}
                      />
                    </Box>
                  )}
                </>
              )}

              {viewMode === 'kanban' && (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                  }}
                >
                  <KanbanBoard
                    ref={kanbanBoardRef}
                    tasks={filteredTasks}
                    resetKey={paginationResetKey}
                    filterParams={listQueryParams}
                    hasNextPage={hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    onFetchNextPage={() => void fetchNextPage()}
                    onHideColumn={toggleKanbanColumn}
                    visibleColumns={visibleKanbanColumns}
                  />
                </Box>
              )}

              {(viewMode === 'table' || reportTasks) && (
                <>
                  <TasksPrintHeader total={printTasks.length} />

                  {viewMode === 'table' && (
                    <Box
                      className="print-no-print"
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        width: '100%',
                      }}
                    >
                      <TaskTable
                        page={tablePage}
                        total={tableData?.total}
                        tasks={filteredTasks}
                        serverPagination
                        onPageChange={handleTablePageChange}
                        isCompany={isCompany}
                        columnFilters={columnFilters}
                      />
                    </Box>
                  )}

                  <Box
                    className="print-only"
                    sx={{
                      display: 'none',
                      '@media print': {
                        display: 'flex',
                        width: '100%',
                      },
                    }}
                  >
                    <TaskTable
                      tasks={printTasks}
                      paginated={false}
                      forPrint
                    />
                  </Box>
                </>
              )}
            </Box>
          </Box>
        )}

        {/* TODO PRIME: merge tasks by post */}
        <ConfirmDialog
          withButtons={false}
          isOpen={isOpenPrimeRecommendation}
          onClose={() => setIsOpenPrimeRecommendation(false)}
        >
          <Typography variant="h6">
            Найдено несколько задач по одному объявлению
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2 }}
          >
            Prime-аккаунт позволяет объединить задачи по одному объявлению в
            одну.
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 4 }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={handleClosePrimeRecommendation}
            >
              Отказаться
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setIsOpenPrimeRecommendation(false);
                navigate(ROUTES.SETTINGS_BILLING);
              }}
            >
              Подключить
            </Button>
          </Stack>
        </ConfirmDialog>

        {isCompany && (
          <AddTaskDialog
            open={isAddTaskOpen}
            onClose={() => setIsAddTaskOpen(false)}
          />
        )}
      </Box>
    </PageLayout>
  );
};

export default MyTasks;
