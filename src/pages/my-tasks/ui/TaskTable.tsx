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

import {
  TASK_STATUS_LABELS,
  isTaskOverdue,
  type Task,
} from '@/entities';
import { getTaskConfig } from '@/features';
import { scrollMainToTop } from '@/shared';

import { TASK_TABLE_PAGE_SIZE } from '../model/constants';
import {
  getTaskCustomerName,
  getTaskTitle,
  sortTasks,
} from '../model/utils';

import { getTaskPath, TaskActionsMenu } from './TaskActionsMenu';

import type { TaskSortField, TaskSortOrder } from '../model/types';

type TaskTableProps = {
  tasks: Task[];
  embedded?: boolean;
  paginated?: boolean;
  rowsPerPage?: number;
  page?: number;
  onPageChange?: (event: unknown, nextPage: number) => void;
};

export const TaskTable = ({
  tasks,
  embedded = false,
  paginated = true,
  rowsPerPage = TASK_TABLE_PAGE_SIZE,
  page: controlledPage,
  onPageChange,
}: TaskTableProps) => {
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [internalPage, setInternalPage] = useState(0);
  const [sortField, setSortField] = useState<TaskSortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');

  const isControlledPagination =
    controlledPage !== undefined && onPageChange !== undefined;
  const page = isControlledPagination ? controlledPage : internalPage;

  const sortedTasks = useMemo(
    () => sortTasks(tasks, sortField, sortOrder),
    [tasks, sortField, sortOrder]
  );

  const pageCount = Math.max(1, Math.ceil(sortedTasks.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);

  const visibleTasks = useMemo(() => {
    if (!paginated) return sortedTasks;

    const start = currentPage * rowsPerPage;

    return sortedTasks.slice(start, start + rowsPerPage);
  }, [sortedTasks, paginated, currentPage, rowsPerPage]);

  const showPagination = paginated && sortedTasks.length > rowsPerPage;

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

  return (
    <Box
      sx={{
        width: '100%',
        ...(embedded
          ? {
              bgcolor: 'transparent',
            }
          : {
              bgcolor: 'white',
              borderRadius: { xs: '16px', md: '32px' },
              border: theme => `1px solid ${theme.palette.secondary.main}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              height: '100%',
            }),
      }}
    >
      <TableContainer
        ref={tableContainerRef}
        sx={{
          width: '100%',
          scrollbarWidth: 'thin',
          ...(embedded
            ? { maxHeight: 420 }
            : {
                flex: 1,
                minHeight: 0,
              }),
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={getSortDirection('title')}>
                <TableSortLabel
                  active={sortField === 'title'}
                  direction={sortField === 'title' ? sortOrder : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Название
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('status')}>
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={sortField === 'status' ? sortOrder : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Статус
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('customer')}>
                <TableSortLabel
                  active={sortField === 'customer'}
                  direction={sortField === 'customer' ? sortOrder : 'asc'}
                  onClick={() => handleSort('customer')}
                >
                  Заказчик
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('updatedAt')}>
                <TableSortLabel
                  active={sortField === 'updatedAt'}
                  direction={sortField === 'updatedAt' ? sortOrder : 'asc'}
                  onClick={() => handleSort('updatedAt')}
                >
                  Обновлено
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('finalDate')}>
                <TableSortLabel
                  active={sortField === 'finalDate'}
                  direction={sortField === 'finalDate' ? sortOrder : 'asc'}
                  onClick={() => handleSort('finalDate')}
                >
                  Дедлайн
                </TableSortLabel>
              </TableCell>

              <TableCell />
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
                  hover
                  onClick={() => navigate(getTaskPath(task))}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'secondary.light' },
                  }}
                >
                  <TableCell>
                    <Stack
                      spacing={1}
                      direction="row"
                      sx={{ alignItems: 'center' }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600 }}
                      >
                        {getTaskTitle(task)}
                      </Typography>
                      {task.urgent && <Whatshot color="error" />}
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={TASK_STATUS_LABELS[task.status]}
                      color={statusColor}
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', minWidth: 120 }}
                    >
                      <Avatar
                        src={task.owner?.avatar ?? ''}
                        sx={{ width: 28, height: 28 }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 120,
                        }}
                      >
                        {getTaskCustomerName(task) || '—'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {formatDistanceToNow(new Date(task.updatedAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {task.finalDate ? (
                      <Chip
                        size="small"
                        label={format(new Date(task.finalDate), 'dd.MM.yyyy')}
                        color={overdue ? 'error' : 'default'}
                        variant={overdue ? 'filled' : 'outlined'}
                        sx={{ height: 24, fontSize: '0.7rem' }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell
                    onClick={event => event.stopPropagation()}
                    onMouseDown={event => event.stopPropagation()}
                  >
                    <TaskActionsMenu
                      task={task}
                      ownerOnly
                    />
                  </TableCell>
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
          count={sortedTasks.length}
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
