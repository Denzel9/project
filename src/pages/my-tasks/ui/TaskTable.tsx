import { Whatshot } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { TASK_STATUS_LABELS, isTaskOverdue, type Task } from '@/entities';
import { UserDisplayName, type User } from '@/entities/user';
import { getTaskConfig } from '@/features';
import { scrollMainToTop } from '@/shared';

import {
  TASK_TABLE_PAGE_SIZE,
  TASK_TABLE_COLUMN_WIDTHS,
} from '../model/constants';
import { getTaskPath, getTaskTitle, sortTasks } from '../model/utils';

import { TaskActionsMenu } from './TaskActionsMenu';

import type { TaskSortField, TaskSortOrder } from '../model/types';

type TaskTableProps = {
  tasks: Task[];
  total?: number;
  page?: number;
  embedded?: boolean;
  forPrint?: boolean;
  isCompany?: boolean;
  paginated?: boolean;
  serverPagination?: boolean;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, nextPage: number) => void;
};

export const TaskTable = ({
  tasks,
  total,
  isCompany,
  onPageChange,
  embedded = false,
  paginated = true,
  serverPagination = false,
  forPrint = false,
  page: controlledPage,
  rowsPerPage = TASK_TABLE_PAGE_SIZE,
}: TaskTableProps) => {
  const navigate = useNavigate();

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [internalPage, setInternalPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');
  const [sortField, setSortField] = useState<TaskSortField>('updatedAt');

  const isControlledPagination =
    controlledPage !== undefined && onPageChange !== undefined;

  const page = isControlledPagination ? controlledPage : internalPage;

  const sortedTasks = useMemo(
    () => sortTasks(tasks, sortField, sortOrder),
    [tasks, sortField, sortOrder]
  );

  const paginationCount = serverPagination
    ? (total ?? sortedTasks.length)
    : sortedTasks.length;

  const pageCount = Math.max(1, Math.ceil(paginationCount / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);

  const visibleTasks = useMemo(() => {
    if (!paginated || serverPagination) return sortedTasks;

    const start = currentPage * rowsPerPage;

    return sortedTasks.slice(start, start + rowsPerPage);
  }, [sortedTasks, paginated, serverPagination, currentPage, rowsPerPage]);

  const showPagination =
    paginated && paginationCount > rowsPerPage && !forPrint;

  const scrollTableToTop = () => {
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    if (!embedded) {
      scrollMainToTop('smooth');
    }
  };

  const handlePageChange = (event: unknown, nextPage: number) => {
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
    if (isControlledPagination) {
      onPageChange?.(null, 0);
    } else {
      setInternalPage(0);
    }
    setSortOrder(
      field === 'title' || field === 'customer' || field === 'status'
        ? 'asc'
        : 'desc'
    );
  };

  const getSortDirection = (field: TaskSortField) =>
    sortField === field ? sortOrder : false;

  const columnCellSx = (width: string | number) => ({
    p: 3,
    width,
    maxWidth: width,
    overflow: 'hidden',
    boxSizing: 'border-box',
  });

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
                borderRadius: { xs: '16px', md: '32px' },
                border: theme => `1px solid ${theme.palette.secondary.main}`,
              }),
      }}
    >
      <TableContainer
        ref={tableContainerRef}
        sx={{
          width: '100%',
          scrollbarWidth: 'thin',
          scrollbarGutter: 'stable',
          ...(forPrint
            ? {
                height: 'auto',
                maxHeight: 'none',
                overflow: 'visible',
              }
            : embedded
              ? {
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                }
              : {
                  flex: 1,
                  minHeight: 0,
                }),
        }}
      >
        <Table
          stickyHeader={!forPrint}
          sx={{ tableLayout: 'fixed', width: '100%' }}
        >
          <colgroup>
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.title }} />
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.status }} />
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.customer }} />
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.updatedAt }} />
            <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.finalDate }} />
            {!forPrint && (
              <col style={{ width: TASK_TABLE_COLUMN_WIDTHS.actions }} />
            )}
          </colgroup>

          <TableHead>
            <TableRow>
              <TableCell
                sortDirection={getSortDirection('title')}
                sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.title)}
              >
                <TableSortLabel
                  active={sortField === 'title'}
                  direction={sortField === 'title' ? sortOrder : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Название
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={getSortDirection('status')}
                sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.status)}
              >
                <TableSortLabel
                  active={sortField === 'status'}
                  onClick={() => handleSort('status')}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                >
                  Статус
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={getSortDirection('customer')}
                sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.customer)}
              >
                <TableSortLabel
                  active={sortField === 'customer'}
                  direction={sortField === 'customer' ? sortOrder : 'asc'}
                  onClick={() => handleSort('customer')}
                >
                  {isCompany ? 'Исполнитель' : 'Заказчик'}
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={getSortDirection('updatedAt')}
                sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.updatedAt)}
              >
                <TableSortLabel
                  active={sortField === 'updatedAt'}
                  direction={sortField === 'updatedAt' ? sortOrder : 'asc'}
                  onClick={() => handleSort('updatedAt')}
                >
                  Обновлено
                </TableSortLabel>
              </TableCell>

              <TableCell
                sortDirection={getSortDirection('finalDate')}
                sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.finalDate)}
              >
                <TableSortLabel
                  active={sortField === 'finalDate'}
                  direction={sortField === 'finalDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('finalDate')}
                  hideSortIcon={forPrint}
                  sx={forPrint ? { pointerEvents: 'none' } : undefined}
                >
                  Дедлайн
                </TableSortLabel>
              </TableCell>

              {!forPrint && (
                <TableCell
                  sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.actions)}
                />
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleTasks.map(task => {
              const columnConfig = getTaskConfig(task.status);
              const statusColor = columnConfig?.color ?? 'primary';
              const overdue = isTaskOverdue(task);

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
                  <TableCell sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.title)}>
                    <Stack
                      spacing={1}
                      direction="row"
                      sx={{ alignItems: 'center', minWidth: 0 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getTaskTitle(task)}

                        {forPrint && task.urgent ? ' (срочная)' : ''}
                      </Typography>
                      {!forPrint && task.urgent && <Whatshot color="error" />}
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
                          src={task.owner?.avatar ?? ''}
                          sx={{ width: 28, height: 28 }}
                        />
                      )}
                      <UserDisplayName user={task.owner as User} />
                    </Stack>
                  </TableCell>

                  <TableCell
                    sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.updatedAt)}
                  >
                    <Typography
                      sx={{ whiteSpace: 'nowrap' }}
                      variant={forPrint ? 'body2' : 'caption'}
                      color={forPrint ? 'text.primary' : 'text.secondary'}
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
                          label={format(new Date(task.finalDate), 'dd.MM.yyyy')}
                          color={overdue ? 'error' : 'default'}
                          variant={overdue ? 'filled' : 'outlined'}
                          sx={{ height: 24, fontSize: '0.7rem' }}
                        />
                      )
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        —
                      </Typography>
                    )}
                  </TableCell>

                  {!forPrint && (
                    <TableCell
                      sx={columnCellSx(TASK_TABLE_COLUMN_WIDTHS.actions)}
                      onClick={event => event.stopPropagation()}
                      onMouseDown={event => event.stopPropagation()}
                    >
                      <TaskActionsMenu
                        task={task}
                        ownerOnly
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
          }}
        />
      )}
    </Box>
  );
};

export default TaskTable;
