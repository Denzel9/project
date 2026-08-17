import { Box, CircularProgress, Grid, Stack } from '@mui/material';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  USER_ROLE,
  fetchAllTasks,
  useTasksInfiniteQuery,
  useTasksQuery,
  type Task,
  type TaskListParams,
  type TaskStatus,
} from '@/entities';
import { useMyTaskFilterStore } from '@/features';
import { useAuthStore } from '@/features/auth';
import { TASK_TABLE_PAGE_SIZE } from '@/pages/my-tasks/model/constants/constants';
import { exportTasksReport } from '@/pages/my-tasks/model/utils/exportTasksReport';
import { useTaskTableColumnFilters } from '@/pages/my-tasks/model/utils/useTaskTableColumnFilters';
import { TaskItem } from '@/pages/my-tasks/ui/TaskItem';
import { TasksPrintHeader } from '@/pages/my-tasks/ui/TasksPrintHeader';
import { TaskTable } from '@/pages/my-tasks/ui/TaskTable';
import { EmptyBlock, InfiniteScrollSentinel } from '@/shared';

import {
  ARCHIVE_TABLE_PAGE_SIZE,
  ARCHIVE_TASKS_VIEW_MODE_KEY,
  type ArchiveTableReport,
  type ArchiveViewMode,
} from '../model/constants';

type ArchivedTasksTabProps = {
  viewMode: ArchiveViewMode;
  onViewModeChange: (viewMode: ArchiveViewMode) => void;
  onTableReportChange: (report: ArchiveTableReport | null) => void;
  searchQuery?: string;
};

const buildArchiveTasksParams = ({
  isCompany,
  status,
  personId,
  urgentOnly,
  updatedDate,
  deadlineDate,
  taskId,
  q,
  onlyMyTasks,
  assigneeAccountId,
}: {
  isCompany: boolean;
  status: TaskStatus[];
  personId: string;
  urgentOnly: boolean;
  updatedDate: string | null;
  deadlineDate: string | null;
  taskId: string;
  q?: string;
  onlyMyTasks?: boolean;
  assigneeAccountId?: string;
}): Omit<TaskListParams, 'page'> => ({
  isArchived: true,
  limit: ARCHIVE_TABLE_PAGE_SIZE,
  ...(status.length > 0 && { statuses: status }),
  ...(personId !== 'all' &&
    (isCompany ? { executorId: personId } : { ownerId: personId })),
  ...(urgentOnly && { urgent: true }),
  ...(updatedDate && { updatedDate }),
  ...(deadlineDate && { deadlineDate }),
  ...(taskId !== 'all' && { taskId }),
  ...(q && { q }),
  ...(onlyMyTasks && { assigneeMine: true }),
  ...(assigneeAccountId &&
    assigneeAccountId !== 'all' &&
    !onlyMyTasks && { assigneeAccountId }),
});

export const ArchivedTasksTab = ({
  viewMode,
  onViewModeChange,
  onTableReportChange,
  searchQuery = '',
}: ArchivedTasksTabProps) => {
  const { role } = useAuthStore();
  const isCompany = role === USER_ROLE.COMPANY;
  const isTableView = viewMode === 'table';
  const onlyMyTasks = useMyTaskFilterStore(state => state.onlyMyTasks);
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId,
  );

  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [reportTasks, setReportTasks] = useState<Task[] | null>(null);
  const [pendingPrint, setPendingPrint] = useState(false);
  const [tablePageState, setTablePageState] = useState({
    filterKey: '',
    page: 0,
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const {
    columnFilters,
    status,
    personId,
    urgentOnly,
    updatedDate,
    deadlineDate,
    taskId,
    taskQuery,
    resetFilters,
    hasActiveFilters,
  } = useTaskTableColumnFilters({ isCompany });

  const resolvedSearchQ = useMemo(() => {
    if (taskId !== 'all') return undefined;

    const fromColumn = taskQuery.trim();
    if (fromColumn) return fromColumn;

    const fromHeader = searchQuery.trim();
    return fromHeader.length >= 2 ? fromHeader : undefined;
  }, [taskId, taskQuery, searchQuery]);

  const headerSearchActive = searchQuery.trim().length >= 2;
  const filtersActive = hasActiveFilters || headerSearchActive;

  const baseParams = useMemo(
    () =>
      buildArchiveTasksParams({
        isCompany,
        status,
        personId,
        urgentOnly,
        updatedDate,
        deadlineDate,
        taskId,
        q: resolvedSearchQ,
        onlyMyTasks,
        assigneeAccountId,
      }),
    [
      isCompany,
      status,
      personId,
      urgentOnly,
      updatedDate,
      deadlineDate,
      taskId,
      resolvedSearchQ,
      onlyMyTasks,
      assigneeAccountId,
    ],
  );

  const paginationResetKey = useMemo(
    () =>
      [
        viewMode,
        status,
        personId,
        urgentOnly,
        updatedDate,
        deadlineDate,
        taskId,
        resolvedSearchQ ?? '',
        onlyMyTasks,
        assigneeAccountId,
      ].join('|'),
    [
      viewMode,
      status,
      personId,
      urgentOnly,
      updatedDate,
      deadlineDate,
      taskId,
      resolvedSearchQ,
      onlyMyTasks,
      assigneeAccountId,
    ],
  );

  const tablePage =
    tablePageState.filterKey === paginationResetKey ? tablePageState.page : 0;

  const tableQueryParams = useMemo(
    () => ({
      ...baseParams,
      page: tablePage + 1,
      limit: TASK_TABLE_PAGE_SIZE,
    }),
    [baseParams, tablePage],
  );

  const { data: tableData, isLoading: isTableLoading } = useTasksQuery(
    tableQueryParams,
    { enabled: isTableView },
  );

  const {
    data: infiniteData,
    isLoading: isInfiniteLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useTasksInfiniteQuery(baseParams, {
    enabled: !isTableView,
    limit: ARCHIVE_TABLE_PAGE_SIZE,
  });

  const listTasks = useMemo(
    () => infiniteData?.pages.flatMap(page => page.items) ?? [],
    [infiniteData?.pages],
  );

  const filteredTasks = isTableView ? (tableData?.items ?? []) : listTasks;
  const totalTasks = isTableView
    ? tableData?.total
    : infiniteData?.pages[0]?.total;
  const isLoading = isTableView ? isTableLoading : isInfiniteLoading;
  const isEmpty = !isLoading && !filteredTasks.length;
  const tableReportDisabled = isLoading || isEmpty;

  const prevViewModeRef = useRef(viewMode);

  useEffect(() => {
    if (prevViewModeRef.current === viewMode) return;
    prevViewModeRef.current = viewMode;
    resetFilters();
  }, [viewMode, resetFilters]);

  useEffect(() => {
    localStorage.setItem(ARCHIVE_TASKS_VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  const handleTablePageChange = (_: unknown, nextPage: number) => {
    setTablePageState({ filterKey: paginationResetKey, page: nextPage });
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchReportTasks = useCallback(async () => {
    return fetchAllTasks(baseParams);
  }, [baseParams]);

  const handlePrint = useCallback(async () => {
    setIsPrinting(true);

    try {
      const tasks = await fetchReportTasks();
      setReportTasks(tasks);
      onViewModeChange('table');
      setPendingPrint(true);
    } catch (error) {
      console.error('Failed to prepare archived tasks report for print', error);
      setIsPrinting(false);
    }
  }, [fetchReportTasks, onViewModeChange]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);

    try {
      const tasks = await fetchReportTasks();
      exportTasksReport(tasks);
    } catch (error) {
      console.error('Failed to export archived tasks report', error);
    } finally {
      setIsExporting(false);
    }
  }, [fetchReportTasks]);

  useEffect(() => {
    onTableReportChange({
      disabled: tableReportDisabled,
      isExporting,
      isPrinting,
      onPrint: () => {
        void handlePrint();
      },
      onExport: () => {
        void handleExport();
      },
    });

    return () => onTableReportChange(null);
  }, [
    onTableReportChange,
    tableReportDisabled,
    isExporting,
    isPrinting,
    handlePrint,
    handleExport,
  ]);

  useEffect(() => {
    if (!pendingPrint || viewMode !== 'table' || !reportTasks) return;

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const handleAfterPrint = () => {
          setPendingPrint(false);
          setReportTasks(null);
          setIsPrinting(false);
        };

        window.addEventListener('afterprint', handleAfterPrint, { once: true });
        window.print();
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pendingPrint, viewMode, reportTasks]);

  const printTasks = reportTasks ?? filteredTasks;

  return (
    <Stack
      spacing={1}
      className={isTableView ? 'print-root' : undefined}
      sx={{
        flex: 1,
        minHeight: 0,
        // ...(isTableView && { height: '100%' }),
        '@media print': {
          height: 'auto',
          minHeight: 'auto',
          overflow: 'visible',
          flex: 'none',
        },
      }}
    >
      {isLoading && !filteredTasks.length ? (
        <Box
          className="print-no-print"
          sx={{
            py: 8,
            display: 'flex',
            justifyContent: 'center',
            border: '1px solid',
            borderRadius: '24px',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <CircularProgress size={32} />
        </Box>
      ) : isEmpty && !isTableView ? (
        <Box
          className="print-no-print"
          sx={{
            py: 6,
            border: '1px solid',
            borderRadius: '24px',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <EmptyBlock title="Архивных задач нет" />
        </Box>
      ) : (
        <Box
          sx={{
            gap: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '24px',
            border: isTableView ? '1px solid' : 'none',
            borderColor: 'divider',
            ...(isTableView && {
              flex: 1,
              minHeight: 0,
            }),
            '@media print': {
              border: 'none',
              borderRadius: 0,
            },
          }}
        >
          <Box
            ref={contentRef}
            sx={{
              flex: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              ...(isTableView && {
                flex: 1,
                minHeight: 0,
              }),
              '@media print': {
                overflow: 'visible',
              },
            }}
          >
            {viewMode === 'grid' && (
              <>
                <Grid
                  container
                  spacing={1}
                  className="print-no-print"
                  sx={{ width: '100%' }}
                >
                  {filteredTasks.map(task => (
                    <Grid
                      key={task.id}
                      size={{ xs: 12, sm: 6, md: 4 }}
                      sx={{ bgcolor: 'background.paper', borderRadius: '24px' }}
                    >
                      <TaskItem
                        task={task}
                        isCompany={isCompany}
                      />
                    </Grid>
                  ))}
                </Grid>

                <InfiniteScrollSentinel
                  onLoadMore={fetchNextPage}
                  isLoading={isFetchingNextPage}
                  hasMore={Boolean(hasNextPage)}
                />
              </>
            )}

            {(isTableView || reportTasks) && (
              <>
                <TasksPrintHeader
                  total={printTasks.length}
                  title="Архив задач"
                />

                {isTableView && (
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
                      total={totalTasks}
                      tasks={filteredTasks}
                      serverPagination
                      onPageChange={handleTablePageChange}
                      isCompany={isCompany}
                      columnFilters={columnFilters}
                      filtersActive={filtersActive}
                      emptyText="Архивных задач нет"
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
                    isCompany={isCompany}
                  />
                </Box>
              </>
            )}
          </Box>
        </Box>
      )}
    </Stack>
  );
};
