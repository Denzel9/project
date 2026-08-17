import { ScheduleOutlined, Whatshot } from '@mui/icons-material';
import {
  Autocomplete,
  Avatar,
  Box,
  Checkbox,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  TASK_STATUS_LABELS,
  getTaskDeadlineUrgency,
  isTaskOverdue,
  TaskRequestStatusIcons,
  useTasksQuery,
  type TaskDeadlineUrgency,
  type TaskStatus,
} from '@/entities';
import {
  UserDisplayName,
  executorToUserPartial,
  getUserName,
  type User,
} from '@/entities/user';
import {
  MemberRole,
  useGetProfileMembersQuery,
} from '@/entities/workspace-member';
import {
  AddTaskDialog,
  getDashboardPeriodRange,
  getTaskConfig,
  toDashboardTasksQueryParams,
  useIsManagerAccount,
  useMyTaskFilterStore,
} from '@/features';
import { EmptyBlock, FilterStatusSelect, scrollMainToTop } from '@/shared';

import {
  TASK_TABLE_PAGE_SIZE,
  TASK_TABLE_COLUMN_WIDTHS,
  TASK_TABLE_MIN_WIDTH,
  COLUMN_FILTER_SEARCH_DEBOUNCE_MS,
  COLUMN_FILTER_SEARCH_MIN,
} from '../model/constants/constants';
import {
  columnCellSx as getColumnCellSx,
  filterCellSx as getFilterCellSx,
  headerCellSx as getHeaderCellSx,
} from '../model/styles';
import { FILTER_AUTOCOMPLETE_SLOT_PROPS } from '../model/utils/taskTableColumnStyles';
import { useTaskSelectionToggle } from '../model/utils/useTaskSelectionToggle';
import {
  getTaskManagerName,
  getTaskPath,
  getTaskTitle,
  sortTasks,
} from '../model/utils/utils';

import { ColumnDateFilter } from './ColumnDateFilter';
import { ColumnFilterButton } from './ColumnFilterButton';
import { TaskActionsMenu } from './TaskActionsMenu';
import { TaskTableHeaderWithFilter } from './TaskTableHeaderWithFilter';

import type { TaskTableCellOptions } from '../model/styles';
import type {
  FilterOption,
  TaskSortField,
  TaskSortOrder,
  TaskTableProps,
} from '../model/types/types';

const getDeadlineIconTitle = (
  urgency: TaskDeadlineUrgency,
  finalDate: string,
) => {
  const dateLabel = format(new Date(finalDate), 'dd.MM.yyyy');

  if (urgency === 'overdue') return `Просрочено · ${dateLabel}`;
  if (urgency === 'today') return `Дедлайн сегодня · ${dateLabel}`;

  return `Дедлайн близко · ${dateLabel}`;
};

export const TaskTable = ({
  tasks,
  total,
  isCompany,
  onPageChange,
  columnFilters,
  embedded = false,
  paginated = true,
  serverPagination = false,
  forPrint = false,
  querySource,
  emptyText,
  filtersActive = false,
  defaultFiltersOpen = false,
  page: controlledPage,
  rowsPerPage = TASK_TABLE_PAGE_SIZE,
  onListStateChange,
}: TaskTableProps) => {
  const isManagerAccount = useIsManagerAccount();
  const onlyMyTasks = useMyTaskFilterStore(state => state.onlyMyTasks);
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId
  );
  const setAssigneeAccountId = useMyTaskFilterStore(
    state => state.setAssigneeAccountId
  );
  const postId = useMyTaskFilterStore(state => state.postId);
  const executorId = useMyTaskFilterStore(state => state.executorId);
  const period = useMyTaskFilterStore(state => state.period);
  const periodRange = useMemo(
    () => getDashboardPeriodRange(period),
    [period]
  );

  // Дашборд: только владелец. Страница задач: владелец и менеджер.
  const showManagerColumn =
    Boolean(isCompany) &&
    (querySource !== 'dashboard' || !isManagerAccount);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLTableRowElement>(null);
  const isSelfFetching = querySource === 'dashboard' && !forPrint;

  const [internalPage, setInternalPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');
  const [sortField, setSortField] = useState<TaskSortField>('updatedAt');
  const [isFilterRowOpen, setIsFilterRowOpen] = useState(defaultFiltersOpen);
  const [headerRowHeight, setHeaderRowHeight] = useState(56);
  const [taskFilterInput, setTaskFilterInput] = useState('');
  const [personFilterInput, setPersonFilterInput] = useState('');
  const [debouncedTaskQuery, setDebouncedTaskQuery] = useState('');
  const [debouncedPersonQuery, setDebouncedPersonQuery] = useState('');
  const [isTaskFilterMenuOpen, setIsTaskFilterMenuOpen] = useState(false);
  const [isPersonFilterMenuOpen, setIsPersonFilterMenuOpen] = useState(false);
  const [selectedTaskOption, setSelectedTaskOption] =
    useState<FilterOption | null>(null);
  const [selectedPersonOption, setSelectedPersonOption] =
    useState<FilterOption | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const filterKey = useMemo(
    () =>
      [
        columnFilters?.status,
        columnFilters?.taskId,
        columnFilters?.personId,
        columnFilters?.urgentOnly,
        columnFilters?.updatedDate,
        columnFilters?.deadlineDate,
        onlyMyTasks,
        assigneeAccountId,
        postId,
        executorId,
        period,
        isCompany,
      ].join('|'),
    [
      columnFilters?.status,
      columnFilters?.taskId,
      columnFilters?.personId,
      columnFilters?.urgentOnly,
      columnFilters?.updatedDate,
      columnFilters?.deadlineDate,
      onlyMyTasks,
      assigneeAccountId,
      postId,
      executorId,
      period,
      isCompany,
    ],
  );

  const [selfPageState, setSelfPageState] = useState({ filterKey, page: 0 });
  const selfPage =
    selfPageState.filterKey === filterKey ? selfPageState.page : 0;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedTaskQuery(taskFilterInput.trim());
    }, COLUMN_FILTER_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [taskFilterInput]);

  const onTaskQueryChange = columnFilters?.onTaskQueryChange;
  const taskIdFilter = columnFilters?.taskId;

  useEffect(() => {
    if (!onTaskQueryChange) return;

    if (taskIdFilter !== 'all') {
      onTaskQueryChange('');
      return;
    }

    onTaskQueryChange(
      debouncedTaskQuery.length >= COLUMN_FILTER_SEARCH_MIN
        ? debouncedTaskQuery
        : '',
    );
  }, [onTaskQueryChange, taskIdFilter, debouncedTaskQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedPersonQuery(personFilterInput.trim());
    }, COLUMN_FILTER_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [personFilterInput]);

  const canSearchTasks =
    Boolean(columnFilters) &&
    !forPrint &&
    columnFilters?.taskId === 'all' &&
    debouncedTaskQuery.length >= COLUMN_FILTER_SEARCH_MIN;

  const canSearchPersons =
    Boolean(columnFilters) &&
    !forPrint &&
    columnFilters?.personId === 'all' &&
    debouncedPersonQuery.length >= COLUMN_FILTER_SEARCH_MIN;

  const listQueryParams = useMemo(() => {
    if (!isSelfFetching || !columnFilters) return undefined;

    return toDashboardTasksQueryParams(
      {
        isCompany: Boolean(isCompany),
        ...(columnFilters.status.length > 0 && { status: columnFilters.status }),
        ...(columnFilters.taskId !== 'all' && { taskId: columnFilters.taskId }),
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
        ...(canSearchTasks && { q: debouncedTaskQuery }),
        ...(canSearchPersons && { personQ: debouncedPersonQuery }),
        onlyMyTasks,
        assigneeAccountId,
        postId,
        executorId,
        ...periodRange,
      },
      {
        page: selfPage + 1,
        limit: rowsPerPage,
      },
    );
  }, [
    isSelfFetching,
    columnFilters,
    isCompany,
    selfPage,
    rowsPerPage,
    canSearchTasks,
    canSearchPersons,
    debouncedTaskQuery,
    debouncedPersonQuery,
    onlyMyTasks,
    assigneeAccountId,
    postId,
    executorId,
    periodRange,
  ]);

  const autocompleteQueryParams = useMemo(() => {
    if (isSelfFetching || !columnFilters || forPrint) return undefined;
    if (!canSearchTasks && !canSearchPersons) return undefined;

    return {
      page: 1,
      limit: 20,
      role: isCompany ? ('owner' as const) : ('executor' as const),
      ...(canSearchTasks && { q: debouncedTaskQuery }),
      ...(canSearchPersons && {
        personQ: debouncedPersonQuery,
        personField: isCompany
          ? ('executor' as const)
          : ('owner' as const),
      }),
    };
  }, [
    isSelfFetching,
    columnFilters,
    forPrint,
    canSearchTasks,
    canSearchPersons,
    isCompany,
    debouncedTaskQuery,
    debouncedPersonQuery,
  ]);

  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    isError: isListError,
  } = useTasksQuery(listQueryParams, { enabled: Boolean(listQueryParams) });

  const { data: autocompleteData, isFetching: isAutocompleteFetching } =
    useTasksQuery(autocompleteQueryParams, {
      enabled: Boolean(autocompleteQueryParams),
    });

  const isTaskSearching =
    canSearchTasks &&
    (isSelfFetching ? isListFetching : isAutocompleteFetching);
  const isPersonSearching =
    canSearchPersons &&
    (isSelfFetching ? isListFetching : isAutocompleteFetching);

  const filterOptionsSource = isSelfFetching
    ? listData?.items
    : autocompleteData?.items;

  const resolvedTasks = useMemo(
    () => (isSelfFetching ? (listData?.items ?? []) : (tasks ?? [])),
    [isSelfFetching, listData?.items, tasks],
  );
  const resolvedTotal = isSelfFetching
    ? (listData?.total ?? 0)
    : (total ?? 0);
  const useServerPagination = isSelfFetching || serverPagination;

  const isControlledPagination =
    !isSelfFetching &&
    controlledPage !== undefined &&
    onPageChange !== undefined;

  const page = isSelfFetching
    ? selfPage
    : isControlledPagination
      ? controlledPage
      : internalPage;

  useEffect(() => {
    if (!isSelfFetching) return;

    onListStateChange?.({
      total: resolvedTotal,
      isLoading: isListLoading,
      isError: isListError,
      isEmpty: !isListLoading && resolvedTasks.length === 0,
    });
  }, [
    isSelfFetching,
    resolvedTotal,
    isListLoading,
    isListError,
    resolvedTasks.length,
    onListStateChange,
  ]);

  const sortedTasks = useMemo(
    () => sortTasks(resolvedTasks, sortField, sortOrder),
    [resolvedTasks, sortField, sortOrder],
  );

  const paginationCount = useServerPagination
    ? (resolvedTotal ?? sortedTasks.length)
    : sortedTasks.length;

  const pageCount = Math.max(1, Math.ceil(paginationCount / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);

  const visibleTasks = useMemo(() => {
    if (!paginated || useServerPagination) return sortedTasks;

    const start = currentPage * rowsPerPage;

    return sortedTasks.slice(start, start + rowsPerPage);
  }, [sortedTasks, paginated, useServerPagination, currentPage, rowsPerPage]);

  const showPagination =
    paginated && paginationCount > rowsPerPage && !forPrint;

  const hasActiveFilters =
    filtersActive ||
    Boolean(
      columnFilters &&
      (columnFilters.status.length > 0 ||
        columnFilters.taskId !== 'all' ||
        Boolean(columnFilters.taskQuery.trim()) ||
        columnFilters.personId !== 'all' ||
        columnFilters.manager !== 'all' ||
        columnFilters.urgentOnly ||
        columnFilters.updatedDate !== null ||
        columnFilters.deadlineDate !== null),
    );

  const isEmptyList =
    Boolean(emptyText) &&
    !forPrint &&
    visibleTasks.length === 0 &&
    !(isSelfFetching && isListLoading);

  const scrollTableToTop = () => {
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    if (!embedded) {
      scrollMainToTop('smooth');
    }
  };

  const handlePageChange = (event: unknown, nextPage: number) => {
    if (isSelfFetching) {
      setSelfPageState({ filterKey, page: nextPage });
      scrollTableToTop();
      return;
    }

    if (isControlledPagination) {
      onPageChange(event, nextPage);
      scrollTableToTop();
      return;
    }

    setInternalPage(nextPage);
    scrollTableToTop();
  };

  const handleSort = (field: TaskSortField) => {
    if (sortField === field) {
      setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    if (isSelfFetching) {
      setSelfPageState({ filterKey, page: 0 });
    } else if (isControlledPagination) {
      onPageChange?.(null, 0);
    } else {
      setInternalPage(0);
    }
    setSortOrder(
      field === 'title' ||
        field === 'customer' ||
        field === 'manager' ||
        field === 'status'
        ? 'asc'
        : 'desc',
    );
  };

  const getSortDirection = (field: TaskSortField) =>
    sortField === field ? sortOrder : false;

  const showColumnFilters = Boolean(columnFilters) && !forPrint;
  const showActions = !forPrint && querySource !== 'dashboard' && isCompany;
  const {
    isTaskSelectionMode,
    isSelected,
    onToggleSelection,
  } = useTaskSelectionToggle();
  const selectionEnabled =
    isTaskSelectionMode && !forPrint && querySource !== 'dashboard';
  const showActionsColumn = showActions || selectionEnabled;
  const showDeadlineColumn = querySource !== 'dashboard';

  useLayoutEffect(() => {
    const row = headerRowRef.current;

    if (!row || forPrint) return;

    const updateHeight = () => {
      setHeaderRowHeight(row.getBoundingClientRect().height);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(row);

    return () => observer.disconnect();
  }, [
    forPrint,
    showColumnFilters,
    showActionsColumn,
    showManagerColumn,
    isCompany,
  ]);
  const statusFilterOptions = useMemo(
    () =>
      Object.entries(TASK_STATUS_LABELS).map(([value, label]) => ({
        value: value as TaskStatus,
        label,
      })),
    [],
  );

  const {
    data: profileMembers,
    isLoading: isManagersLoading,
  } = useGetProfileMembersQuery(showManagerColumn && showColumnFilters);

  const managerFilterOptions = useMemo(() => {
    if (!profileMembers) return [] as FilterOption[];

    return profileMembers
      .filter(member => member.membershipRole === MemberRole.ADMIN)
      .map(member => ({
        id: member.accountId,
        label: member.displayName || member.email || 'Менеджер',
      }));
  }, [profileMembers]);

  const taskFilterOptions = useMemo(() => {
    if (!canSearchTasks) return [] as FilterOption[];

    return (filterOptionsSource ?? []).map(task => ({
      id: task.id,
      label: getTaskTitle(task),
    }));
  }, [canSearchTasks, filterOptionsSource]);

  const personFilterOptions = useMemo(() => {
    if (!canSearchPersons) return [] as FilterOption[];

    const seen = new Set<string>();

    return (filterOptionsSource ?? []).flatMap(task => {
      if (isCompany) {
        const id = task.executorId;
        if (!id || seen.has(id) || !task.executor) return [];

        const label = (
          getUserName(executorToUserPartial(task.executor)) ?? ''
        ).trim();
        if (!label) return [];

        seen.add(id);
        return [{ id, label }];
      }

      const id = task.ownerId;
      if (!id || seen.has(id) || !task.owner) return [];

      const label = (
        task.owner.companyProfile?.companyName?.trim() ||
        getUserName(task.owner as Partial<User>) ||
        ''
      ).trim();
      if (!label) return [];

      seen.add(id);
      return [{ id, label }];
    });
  }, [canSearchPersons, isCompany, filterOptionsSource]);

  const taskFilterValue =
    columnFilters?.taskId === 'all' || !columnFilters
      ? null
      : (taskFilterOptions.find(option => option.id === columnFilters.taskId) ??
        selectedTaskOption);

  const personFilterValue =
    columnFilters?.personId === 'all' || !columnFilters
      ? null
      : (personFilterOptions.find(
        option => option.id === columnFilters.personId,
      ) ?? selectedPersonOption);

  const toggleFilterRow = () => {
    setIsFilterRowOpen(current => !current);
  };

  const edgePadding = showActionsColumn ? '32px' : undefined;
  const compactSidePadding = showColumnFilters ? 1.5 : 3;
  const extraFirstPaddingPx = querySource === 'dashboard' ? 0 : 16;

  const columnCellSx = (
    width: string | number,
    options?: TaskTableCellOptions,
  ) =>
    getColumnCellSx(
      width,
      isSelfFetching,
      showColumnFilters,
      compactSidePadding,
      edgePadding,
      options,
      extraFirstPaddingPx,
    );

  const headerCellSx = (
    width: string | number,
    options?: TaskTableCellOptions,
  ) =>
    getHeaderCellSx(
      width,
      isSelfFetching,
      showColumnFilters,
      compactSidePadding,
      edgePadding,
      options,
      extraFirstPaddingPx,
    );

  const filterCellSx = (
    width: string | number,
    options?: TaskTableCellOptions,
  ) =>
    getFilterCellSx(
      width,
      edgePadding,
      isFilterRowOpen,
      headerRowHeight,
      options,
      extraFirstPaddingPx,
    );

  const renderFilterCellContent = (content: ReactNode) => (
    <Collapse
      in={isFilterRowOpen}
      timeout={220}
      unmountOnExit={false}
    >
      <Box sx={{ py: 1.25 }}>{content}</Box>
    </Collapse>
  );

  // Без фильтров — пустой экран целиком. С фильтрами оставляем шапку.
  if (isEmptyList && !hasActiveFilters) {
    return (
      <Stack
        sx={{
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: embedded ? 'transparent' : 'background.paper',
          borderRadius: embedded ? 0 : '24px',
        }}
      >
        <EmptyBlock title={emptyText} />
      </Stack>
    );
  }

  return (
    <Box
      className={forPrint ? 'print-table' : undefined}
      sx={{
        width: '100%',
        ...(forPrint
          ? {
            height: 'auto',
            bgcolor: 'background.paper',
            display: 'block',
            overflow: 'visible',
          }
          : embedded
            ? {
              flex: 1,
              minHeight: 0,
              height: '100%',
              display: 'flex',
              bgcolor: 'transparent',
              flexDirection: 'column',
            }
            : {
              flex: 1,
              minHeight: 0,
              height: '100%',
              display: 'flex',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              flexDirection: 'column',
              borderRadius: '24px',
            }),
      }}
    >
      <TableContainer
        ref={tableContainerRef}
        sx={{
          width: '100%',
          scrollbarWidth: 'none',
          ...(forPrint
            ? {
              height: 'auto',
              maxHeight: 'none',
              overflow: 'visible',
            }
            : visibleTasks.length
              ? {
                flex: 1,
                minHeight: 0,
                overflow: 'auto',
              }
              : {
                flex: '0 0 auto',
                overflow: 'visible',
              }),
        }}
      >
        <Table
          stickyHeader={!forPrint}
          sx={{
            tableLayout: 'fixed',
            width: '100%',
            ...(!forPrint && { minWidth: TASK_TABLE_MIN_WIDTH }),
          }}
        >
          <colgroup>
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.title }} />
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.status }} />
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.customer }} />
            {showManagerColumn && (
              <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.manager }} />
            )}
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.updatedAt }} />
            {showDeadlineColumn && (
              <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.finalDate }} />
            )}
            {showActionsColumn && (
              <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.actions }} />
            )}
          </colgroup>

          <TableHead>
            <TableRow ref={headerRowRef}>
              <TableCell
                sortDirection={getSortDirection('title')}
                sx={headerCellSx(TASK_TABLE_COLUMN_WIDTHS.title, {
                  first: true,
                })}
              >
                <TaskTableHeaderWithFilter
                  isActive={
                    columnFilters?.taskId !== 'all' ||
                    Boolean(columnFilters?.taskQuery.trim()) ||
                    Boolean(columnFilters?.urgentOnly)
                  }
                  field="title"
                  label="Название"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  forPrint={forPrint}
                  onSort={handleSort}
                  filter={
                    showColumnFilters && columnFilters ? (
                      <Stack
                        spacing={0}
                        direction="row"
                        sx={{ alignItems: 'center' }}
                      >
                        <ColumnFilterButton
                          title="Задача"
                          open={isFilterRowOpen}
                          active={
                            columnFilters.taskId !== 'all' ||
                            Boolean(columnFilters.taskQuery.trim())
                          }
                          onClick={toggleFilterRow}
                        />
                        <Tooltip
                          title={
                            columnFilters.urgentOnly
                              ? 'Показать все задачи'
                              : 'Только срочные задачи'
                          }
                        >
                          <IconButton
                            size="small"
                            aria-label="Только срочные"
                            aria-pressed={columnFilters.urgentOnly}
                            onClick={event => {
                              event.stopPropagation();
                              columnFilters.onUrgentOnlyChange(
                                !columnFilters.urgentOnly,
                              );
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <Whatshot
                              color={
                                columnFilters.urgentOnly ? 'error' : 'action'
                              }
                              sx={{ fontSize: 18 }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : undefined
                  }
                />
              </TableCell>

              <TableCell
                sortDirection={getSortDirection('status')}
                sx={headerCellSx(TASK_TABLE_COLUMN_WIDTHS.status)}
              >
                <TaskTableHeaderWithFilter
                  isActive={Boolean(columnFilters?.status.length)}
                  field="status"
                  label="Статус"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  forPrint={forPrint}
                  onSort={handleSort}
                  filter={
                    showColumnFilters && columnFilters ? (
                      <ColumnFilterButton
                        title="Статус"
                        open={isFilterRowOpen}
                        active={columnFilters.status.length > 0}
                        onClick={toggleFilterRow}
                      />
                    ) : undefined
                  }
                />
              </TableCell>

              <TableCell
                sortDirection={getSortDirection('customer')}
                sx={headerCellSx(TASK_TABLE_COLUMN_WIDTHS.customer)}
              >
                <TaskTableHeaderWithFilter
                  isActive={columnFilters?.personId !== 'all'}
                  field="customer"
                  label={isCompany ? 'Исполнитель' : 'Заказчик'}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  forPrint={forPrint}
                  onSort={handleSort}
                  filter={
                    showColumnFilters && columnFilters ? (
                      <ColumnFilterButton
                        title={columnFilters.personLabel}
                        open={isFilterRowOpen}
                        active={columnFilters.personId !== 'all'}
                        onClick={toggleFilterRow}
                      />
                    ) : undefined
                  }
                />
              </TableCell>

              {showManagerColumn && (
                <TableCell
                  sortDirection={getSortDirection('manager')}
                  sx={headerCellSx(TASK_TABLE_COLUMN_WIDTHS.manager)}
                >
                  <TaskTableHeaderWithFilter
                    isActive={assigneeAccountId !== 'all'}
                    field="manager"
                    label="Менеджер"
                    sortField={sortField}
                    sortOrder={sortOrder}
                    forPrint={forPrint}
                    onSort={handleSort}
                    filter={
                      showColumnFilters && columnFilters ? (
                        <ColumnFilterButton
                          title="Менеджер"
                          open={isFilterRowOpen}
                          active={assigneeAccountId !== 'all'}
                          onClick={toggleFilterRow}
                        />
                      ) : undefined
                    }
                  />
                </TableCell>
              )}

              <TableCell
                sortDirection={getSortDirection('updatedAt')}
                sx={headerCellSx(TASK_TABLE_COLUMN_WIDTHS.updatedAt)}
              >
                <TaskTableHeaderWithFilter
                  isActive={Boolean(columnFilters?.updatedDate)}
                  field="updatedAt"
                  label="Обновлено"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  forPrint={forPrint}
                  onSort={handleSort}
                  filter={
                    showColumnFilters && columnFilters ? (
                      <ColumnFilterButton
                        title="Обновлено"
                        open={isFilterRowOpen}
                        active={Boolean(columnFilters.updatedDate)}
                        onClick={toggleFilterRow}
                      />
                    ) : undefined
                  }
                />
              </TableCell>

              {showDeadlineColumn && (
                <TableCell
                  sortDirection={getSortDirection('finalDate')}
                  sx={headerCellSx(TASK_TABLE_COLUMN_WIDTHS.finalDate)}
                >
                  <TaskTableHeaderWithFilter
                    isActive={Boolean(columnFilters?.deadlineDate)}
                    field="finalDate"
                    label="Дедлайн"
                    sortField={sortField}
                    sortOrder={sortOrder}
                    forPrint={forPrint}
                    onSort={handleSort}
                    filter={
                      showColumnFilters && columnFilters ? (
                        <ColumnFilterButton
                          title="Дедлайн"
                          open={isFilterRowOpen}
                          active={Boolean(columnFilters.deadlineDate)}
                          onClick={toggleFilterRow}
                        />
                      ) : undefined
                    }
                  />
                </TableCell>
              )}

              {showActionsColumn && <TableCell />}
            </TableRow>

            {showColumnFilters && columnFilters && (
              <TableRow>
                <TableCell
                  sx={filterCellSx(TASK_TABLE_COLUMN_WIDTHS.title, {
                    first: true,
                  })}
                >
                  {renderFilterCellContent(
                    <Box onClick={event => event.stopPropagation()}>
                      <Autocomplete
                        size="small"
                        fullWidth
                        loading={isTaskSearching}
                        options={taskFilterOptions}
                        filterOptions={options => options}
                        slotProps={FILTER_AUTOCOMPLETE_SLOT_PROPS}
                        open={isTaskFilterMenuOpen}
                        onOpen={() => {
                          if (
                            taskFilterInput.trim().length >=
                            COLUMN_FILTER_SEARCH_MIN
                          ) {
                            setIsTaskFilterMenuOpen(true);
                          }
                        }}
                        onClose={() => setIsTaskFilterMenuOpen(false)}
                        inputValue={taskFilterInput}
                        onInputChange={(_, value, reason) => {
                          if (reason === 'reset') return;

                          setTaskFilterInput(value);
                          if (reason === 'input') {
                            if (columnFilters.taskId !== 'all') {
                              setSelectedTaskOption(null);
                              columnFilters.onTaskIdChange('all');
                            }
                            setIsTaskFilterMenuOpen(
                              value.trim().length >= COLUMN_FILTER_SEARCH_MIN,
                            );
                            return;
                          }
                          if (reason === 'clear') {
                            setSelectedTaskOption(null);
                            setIsTaskFilterMenuOpen(false);
                            columnFilters.onTaskIdChange('all');
                          }
                        }}
                        noOptionsText={
                          isTaskSearching ? 'Поиск…' : 'Ничего не найдено'
                        }
                        value={taskFilterValue}
                        onChange={(_, option) => {
                          setSelectedTaskOption(option);
                          setTaskFilterInput(option?.label ?? '');
                          setIsTaskFilterMenuOpen(false);
                          columnFilters.onTaskIdChange(option?.id ?? 'all');
                        }}
                        getOptionLabel={option => option.label}
                        isOptionEqualToValue={(option, current) =>
                          option.id === current.id
                        }
                        clearOnEscape
                        renderInput={params => (
                          <TextField
                            {...params}
                            size="small"
                            variant="standard"
                            placeholder="Все задачи"
                          />
                        )}
                      />
                    </Box>,
                  )}
                </TableCell>

                <TableCell sx={filterCellSx(TASK_TABLE_COLUMN_WIDTHS.status)}>
                  {renderFilterCellContent(
                    <Box onClick={event => event.stopPropagation()}>
                      <FilterStatusSelect
                        size="small"
                        value={columnFilters.status}
                        options={statusFilterOptions}
                        onChange={columnFilters.onStatusChange}
                      />
                    </Box>,
                  )}
                </TableCell>

                <TableCell sx={filterCellSx(TASK_TABLE_COLUMN_WIDTHS.customer)}>
                  {renderFilterCellContent(
                    <Box onClick={event => event.stopPropagation()}>
                      <Autocomplete
                        size="small"
                        fullWidth
                        loading={isPersonSearching}
                        options={personFilterOptions}
                        filterOptions={options => options}
                        slotProps={FILTER_AUTOCOMPLETE_SLOT_PROPS}
                        open={isPersonFilterMenuOpen}
                        onOpen={() => {
                          if (
                            personFilterInput.trim().length >=
                            COLUMN_FILTER_SEARCH_MIN
                          ) {
                            setIsPersonFilterMenuOpen(true);
                          }
                        }}
                        onClose={() => setIsPersonFilterMenuOpen(false)}
                        inputValue={personFilterInput}
                        onInputChange={(_, value, reason) => {
                          if (reason === 'reset') return;

                          setPersonFilterInput(value);
                          if (reason === 'input') {
                            if (columnFilters.personId !== 'all') {
                              setSelectedPersonOption(null);
                              columnFilters.onPersonIdChange('all');
                            }
                            setIsPersonFilterMenuOpen(
                              value.trim().length >= COLUMN_FILTER_SEARCH_MIN,
                            );
                            return;
                          }
                          if (reason === 'clear') {
                            setSelectedPersonOption(null);
                            setIsPersonFilterMenuOpen(false);
                            columnFilters.onPersonIdChange('all');
                          }
                        }}
                        noOptionsText={
                          isPersonSearching ? 'Поиск…' : 'Ничего не найдено'
                        }
                        value={personFilterValue}
                        onChange={(_, option) => {
                          setSelectedPersonOption(option);
                          setPersonFilterInput(option?.label ?? '');
                          setIsPersonFilterMenuOpen(false);
                          columnFilters.onPersonIdChange(option?.id ?? 'all');
                        }}
                        getOptionLabel={option => option.label}
                        isOptionEqualToValue={(option, current) =>
                          option.id === current.id
                        }
                        clearOnEscape
                        renderInput={params => (
                          <TextField
                            {...params}
                            size="small"
                            variant="standard"
                            placeholder={`Все ${isCompany ? 'исполнители' : 'заказчики'}`}
                          />
                        )}
                      />
                    </Box>,
                  )}
                </TableCell>

                {showManagerColumn && (
                  <TableCell
                    sx={filterCellSx(TASK_TABLE_COLUMN_WIDTHS.manager)}
                  >
                    {renderFilterCellContent(
                      <Box onClick={event => event.stopPropagation()}>
                        <Autocomplete
                          size="small"
                          fullWidth
                          loading={isManagersLoading}
                          options={managerFilterOptions}
                          slotProps={FILTER_AUTOCOMPLETE_SLOT_PROPS}
                          value={
                            assigneeAccountId === 'all'
                              ? null
                              : (managerFilterOptions.find(
                                option =>
                                  option.id === assigneeAccountId,
                              ) ?? null)
                          }
                          onChange={(_, option) => {
                            setAssigneeAccountId(option?.id ?? 'all');
                          }}
                          getOptionLabel={option => option.label}
                          isOptionEqualToValue={(option, current) =>
                            option.id === current.id
                          }
                          clearOnEscape
                          noOptionsText={
                            isManagersLoading ? 'Загрузка…' : 'Ничего не найдено'
                          }
                          renderInput={params => (
                            <TextField
                              {...params}
                              size="small"
                              variant="standard"
                              placeholder="Все менеджеры"
                            />
                          )}
                        />
                      </Box>,
                    )}
                  </TableCell>
                )}

                <TableCell sx={filterCellSx(TASK_TABLE_COLUMN_WIDTHS.updatedAt)}>
                  {renderFilterCellContent(
                    <ColumnDateFilter
                      value={columnFilters.updatedDate}
                      placeholder="Все даты"
                      todayLabel="Обновлено сегодня"
                      onChange={columnFilters.onUpdatedDateChange}
                    />,
                  )}
                </TableCell>

                {showDeadlineColumn && (
                  <TableCell sx={filterCellSx(TASK_TABLE_COLUMN_WIDTHS.finalDate)}>
                    {renderFilterCellContent(
                      <ColumnDateFilter
                        value={columnFilters.deadlineDate}
                        placeholder="Все даты"
                        todayLabel="Дедлайн сегодня"
                        onChange={columnFilters.onDeadlineDateChange}
                      />,
                    )}
                  </TableCell>
                )}

                {showActionsColumn && (
                  <TableCell
                    sx={filterCellSx(TASK_TABLE_COLUMN_WIDTHS.actions, {
                      actions: true,
                    })}
                  >
                    {renderFilterCellContent(null)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableHead>

          <TableBody>
            {visibleTasks.map(task => {
              const columnConfig = getTaskConfig(task.status);
              const statusColor = columnConfig?.color ?? 'primary';
              const overdue = isTaskOverdue(task);
              const deadlineUrgency = getTaskDeadlineUrgency(task);
              const managerName = getTaskManagerName(task);
              const managerInitials = managerName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part.charAt(0).toUpperCase())
                .join('');
              const selected = selectionEnabled && isSelected(task.id);

              return (
                <TableRow
                  key={task.id}
                  hover={!forPrint}
                  onClick={
                    forPrint
                      ? undefined
                      : () => {
                        if (selectionEnabled) {
                          onToggleSelection(task);
                          return;
                        }

                        window.open(
                          getTaskPath(task),
                          '_blank',
                          'noopener,noreferrer',
                        );
                      }
                  }
                  sx={{
                    cursor: forPrint ? 'default' : 'pointer',
                    ...(selected && {
                      bgcolor: 'action.selected',
                    }),
                    ...(!forPrint && {
                      '&:hover': { bgcolor: 'secondary.light' },
                    }),
                  }}
                >
                  <TableCell sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.title, { first: true })}>
                    <Stack
                      spacing={1}
                      direction="row"
                      sx={{ alignItems: 'end', }}
                    >
                      <Stack spacing={0} sx={{ flex: 1, }}>
                        {querySource !== 'dashboard' && task.post?.title && (
                          <Typography
                            variant="caption"
                            color="info"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.2,
                            }}
                          >
                            {task.post.title?.length > 20 ? task.post.title?.slice(0, 20) + '...' : task.post.title}
                          </Typography>
                        )}
                        <Tooltip title={getTaskTitle(task)}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {getTaskTitle(task)?.length > 25 ? getTaskTitle(task)?.slice(0, 25) + '...' : getTaskTitle(task)}
                            {forPrint && task.urgent ? ' (срочная)' : ''}
                          </Typography>
                        </Tooltip>
                      </Stack>
                      {!forPrint && task.urgent && <Whatshot color="error" sx={{ fontSize: 20 }} />}
                      {querySource === 'dashboard' &&
                        !forPrint &&
                        deadlineUrgency &&
                        task.finalDate && (
                          <Tooltip
                            title={getDeadlineIconTitle(
                              deadlineUrgency,
                              task.finalDate,
                            )}
                          >
                            <Box
                              component="span"
                              sx={{ display: 'flex', flexShrink: 0 }}
                            >
                              <ScheduleOutlined
                                color={deadlineUrgency === 'overdue' ? "error" : "warning"}
                                sx={{ fontSize: 20 }}
                              />
                            </Box>
                          </Tooltip>
                        )}
                      {!forPrint && <TaskRequestStatusIcons task={task} />}
                    </Stack>
                  </TableCell>

                  <TableCell sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.status)}>
                    {forPrint ? (
                      <Typography variant="body2">
                        {TASK_STATUS_LABELS[task.status]}
                      </Typography>
                    ) : (
                      <Chip
                        size="small"
                        label={TASK_STATUS_LABELS[task.status]}
                        color={statusColor}
                        variant="outlined"
                      />
                    )}
                  </TableCell>

                  <TableCell
                    sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.customer)}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', minWidth: 0 }}
                    >
                      {!forPrint && (
                        <Avatar
                          src={
                            (isCompany
                              ? task.executor?.avatar
                              : task.owner?.avatar) || undefined
                          }
                          sx={{ width: 28, height: 28 }}
                        />
                      )}

                      <UserDisplayName
                        user={
                          isCompany
                            ? executorToUserPartial(task.executor)
                            : (task.owner as Partial<User>)
                        }
                        variant="body2"
                        withBadges={false}
                        sx={{
                          minWidth: 0,
                          '& .MuiTypography-root': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          },
                        }}
                      />
                    </Stack>
                  </TableCell>

                  {showManagerColumn && (
                    <TableCell
                      sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.manager)}
                    >
                      {managerName ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', minWidth: 0 }}
                        >
                          {!forPrint && (
                            <Avatar
                              sx={{ width: 28, height: 28, fontSize: 12 }}
                            >
                              {managerInitials || '?'}
                            </Avatar>
                          )}
                          <Typography
                            variant="body2"
                            noWrap
                            title={managerName}
                          >
                            {managerName}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography
                          variant="body2"
                          color="info"
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>
                  )}

                  <TableCell
                    sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.updatedAt)}
                  >
                    <Typography
                      sx={{ whiteSpace: 'nowrap' }}
                      variant={forPrint ? 'body2' : 'caption'}
                      color={forPrint ? 'text.primary' : 'text.info'}
                    >
                      {forPrint
                        ? format(new Date(task.updatedAt), 'dd.MM.yyyy HH:mm', {
                          locale: ru,
                        })
                        : formatDistanceToNow(new Date(task.updatedAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                    </Typography>
                  </TableCell>

                  {showDeadlineColumn && (
                    <TableCell
                      sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.finalDate)}
                    >
                      {task.finalDate ? (
                        forPrint ? (
                          <Typography variant="body2">
                            {format(new Date(task.finalDate), 'dd.MM.yyyy', {
                              locale: ru,
                            })}
                          </Typography>
                        ) : (
                          <Chip
                            size="small"
                            label={
                              isToday(new Date(task.finalDate))
                                ? 'Дедлайн сегодня'
                                : format(new Date(task.finalDate), 'dd.MM.yyyy')
                            }
                            color={overdue ? 'error' : 'default'}
                            variant={overdue ? 'filled' : 'outlined'}
                            sx={{ height: 24, fontSize: '0.7rem' }}
                          />
                        )
                      ) : (
                        <Typography
                          variant="body2"
                          color="info"
                        >
                          —
                        </Typography>
                      )}
                    </TableCell>
                  )}

                  {showActionsColumn && (
                    <TableCell
                      sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.actions, {
                        actions: true,
                      })}
                      onClick={event => event.stopPropagation()}
                      onMouseDown={event => event.stopPropagation()}
                    >
                      {selectionEnabled ? (
                        <Checkbox
                          size="small"
                          checked={selected}
                          onChange={() => onToggleSelection(task)}
                        />
                      ) : (
                        <TaskActionsMenu
                          task={task}
                          ownerOnly={isCompany}
                        />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {isEmptyList && hasActiveFilters && (
        <Stack
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <EmptyBlock title={emptyText} />
        </Stack>
      )}

      {showPagination && (
        <TablePagination
          component="div"
          page={currentPage}
          count={paginationCount}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          rowsPerPageOptions={[rowsPerPage]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} из ${count}`
          }
          sx={{
            flexShrink: 0,
            borderTop: '1px solid',
            borderColor: 'divider',
            pr: querySource === 'dashboard' ? undefined : '32px !important',
          }}
        />
      )}

      {showActions && isCompany && (
        <AddTaskDialog
          open={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
        />
      )}
    </Box>
  );
};

export default TaskTable;
