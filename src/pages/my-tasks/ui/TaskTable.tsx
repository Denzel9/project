import { Whatshot } from '@mui/icons-material';
import {
  Autocomplete,
  Avatar,
  Box,
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
import { useNavigate } from 'react-router';

import {
  TASK_STATUS_LABELS,
  isTaskOverdue,
  TaskRequestStatusIcons,
  useTasksQuery,
  type TaskStatus,
} from '@/entities';
import {
  UserDisplayName,
  executorToUserPartial,
  getUserName,
  type User,
} from '@/entities/user';
import {
  AddTaskDialog,
  getDashboardPeriodRange,
  getTaskConfig,
  toDashboardTasksQueryParams,
  useIsManagerAccount,
  useMyTaskFilterStore,
} from '@/features';
import { EmptyBlock, scrollMainToTop } from '@/shared';

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
  page: controlledPage,
  rowsPerPage = TASK_TABLE_PAGE_SIZE,
  onListStateChange,
}: TaskTableProps) => {
  const navigate = useNavigate();
  const isManagerAccount = useIsManagerAccount();
  const onlyMyTasks = useMyTaskFilterStore(state => state.onlyMyTasks);
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId
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
  const [isFilterRowOpen, setIsFilterRowOpen] = useState(false);
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

  useEffect(() => {
    if (!columnFilters?.onTaskQueryChange) return;

    if (columnFilters.taskId !== 'all') {
      columnFilters.onTaskQueryChange('');
      return;
    }

    columnFilters.onTaskQueryChange(
      debouncedTaskQuery.length >= COLUMN_FILTER_SEARCH_MIN
        ? debouncedTaskQuery
        : '',
    );
  }, [
    columnFilters?.onTaskQueryChange,
    columnFilters?.taskId,
    debouncedTaskQuery,
  ]);

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
        ...(columnFilters.status !== 'all' && { status: columnFilters.status }),
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
  }, [forPrint, showColumnFilters, showActions, showManagerColumn, isCompany]);
  const statusFilterOptions = useMemo(
    () =>
      Object.entries(TASK_STATUS_LABELS).map(([id, label]) => ({ id, label })),
    [],
  );

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

  const edgePadding = showActions ? '32px' : undefined;
  const compactSidePadding = showColumnFilters ? 1.5 : 3;

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

  if (isSelfFetching && visibleTasks.length === 0 && emptyText) {
    return <Stack sx={{ height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyBlock
        title={emptyText}
        description={emptyText}
      />
    </Stack>
  }

  return (
    <Box
      className={forPrint ? 'print-table' : undefined}
      sx={{
        width: '100%',
        ...(forPrint
          ? {
            height: 'auto',
            bgcolor: 'white',
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
              bgcolor: 'white',
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
            : {
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
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
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.finalDate }} />
            {showActions && (
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
                  field="title"
                  label="Название"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  forPrint={forPrint}
                  onSort={handleSort}
                  filter={
                    showColumnFilters && columnFilters ? (
                      <Stack
                        direction="row"
                        spacing={0}
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
                              sx={{ fontSize: 16 }}
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
                        active={columnFilters.status !== 'all'}
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
                    field="manager"
                    label="Менеджер"
                    sortField={sortField}
                    sortOrder={sortOrder}
                    forPrint={forPrint}
                    onSort={handleSort}
                  />
                </TableCell>
              )}

              <TableCell
                sortDirection={getSortDirection('updatedAt')}
                sx={headerCellSx(TASK_TABLE_COLUMN_WIDTHS.updatedAt)}
              >
                <TaskTableHeaderWithFilter
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

              <TableCell
                sortDirection={getSortDirection('finalDate')}
                sx={headerCellSx(TASK_TABLE_COLUMN_WIDTHS.finalDate)}
              >
                <TaskTableHeaderWithFilter
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

              {showActions && <TableCell />}
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
                      <Autocomplete
                        size="small"
                        fullWidth
                        options={statusFilterOptions}
                        slotProps={FILTER_AUTOCOMPLETE_SLOT_PROPS}
                        value={
                          columnFilters.status === 'all'
                            ? null
                            : (statusFilterOptions.find(
                              option => option.id === columnFilters.status,
                            ) ?? null)
                        }
                        onChange={(_, option) =>
                          columnFilters.onStatusChange(
                            (option?.id as TaskStatus | undefined) ?? 'all',
                          )
                        }
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
                            placeholder="Все статусы"
                          />
                        )}
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
                  />
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

                {showActions && (
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
              const managerName = getTaskManagerName(task);
              const managerInitials = managerName
                .split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map(part => part.charAt(0).toUpperCase())
                .join('');

              return (
                <TableRow
                  key={task.id}
                  hover={!forPrint}
                  onClick={
                    forPrint ? undefined : () => navigate(getTaskPath(task))
                  }
                  sx={{
                    cursor: forPrint ? 'default' : 'pointer',
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

                  {showActions && (
                    <TableCell
                      sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.actions, {
                        actions: true,
                      })}
                      onClick={event => event.stopPropagation()}
                      onMouseDown={event => event.stopPropagation()}
                    >
                      <TaskActionsMenu
                        task={task}
                        ownerOnly={isCompany}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
