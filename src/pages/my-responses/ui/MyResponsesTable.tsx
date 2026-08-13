import { Cancel, Chat, Task } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  type Application,
} from '@/entities/application';
import { APPLICATION_STATUS_ENUM } from '@/entities/application/model/utils';
import { UserDisplayName, type User } from '@/entities/user';
import { ROUTES, scrollMainToTop } from '@/shared';
import { WithdrawDialog } from '@/widgets/post-item/ui/WithdrawDialog';

import {
  MY_RESPONSE_TABLE_COLUMN_WIDTHS,
  MY_RESPONSE_TABLE_PAGE_SIZE,
} from '../model/constants';
import { getMyResponseStatusColor, sortMyResponses } from '../model/utils';

import { MyResponseDetailsDialog } from './MyResponseDetailsDialog';

import type { MyResponseSortField, MyResponseSortOrder } from '../model/types';

type MyResponsesTableProps = {
  applications: Application[];
  total?: number;
  page?: number;
  forPrint?: boolean;
  paginated?: boolean;
  serverPagination?: boolean;
  rowsPerPage?: number;
  withdrawingId?: string | null;
  taskByPostId?: Map<string, { id: string }>;
  onWithdraw: (applicationId: string) => void;
  onPageChange?: (event: unknown, nextPage: number) => void;
};

const ResponseRowActions = ({
  application,
  taskId,
  withdrawingId,
  onWithdraw,
}: {
  application: Application;
  taskId?: string | null;
  withdrawingId?: string | null;
  onWithdraw: (applicationId: string) => void;
}) => {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const isWithdrawing = withdrawingId === application.id;
  const post = application.post;

  const canWithdraw = application.status === APPLICATION_STATUS_ENUM.NEW;
  const isAccepted = application.status === APPLICATION_STATUS_ENUM.ACCEPTED;

  if (!canWithdraw && !isAccepted) return null;

  return (
    <>
      <Stack
        direction="row"
        spacing={0.5}
        onClick={event => event.stopPropagation()}
      >
        {canWithdraw && (
          <IconButton
            color="error"
            disabled={isWithdrawing}
            onClick={() => setIsWithdrawOpen(true)}
          >
            <Cancel />
          </IconButton>
        )}

        {isAccepted && (
          <>
            {taskId && (
              <IconButton
                size="small"
                component={Link}
                to={`${ROUTES.TASK}/${post?.id}?taskId=${taskId}`}
              >
                <Task />
              </IconButton>
            )}
            <IconButton
              size="small"
              component={Link}
              to={`${ROUTES.CHAT}?recipientId=${post?.ownerId ?? ''}`}
            >
              <Chat />
            </IconButton>
          </>
        )}
      </Stack>

      <WithdrawDialog
        open={isWithdrawOpen}
        isPending={isWithdrawing}
        onClose={() => setIsWithdrawOpen(false)}
        onConfirm={() => {
          onWithdraw(application.id);
          setIsWithdrawOpen(false);
        }}
      />
    </>
  );
};

export const MyResponsesTable = ({
  applications,
  total,
  page: controlledPage,
  forPrint = false,
  paginated = true,
  serverPagination = false,
  rowsPerPage = MY_RESPONSE_TABLE_PAGE_SIZE,
  withdrawingId = null,
  taskByPostId,
  onWithdraw,
  onPageChange,
}: MyResponsesTableProps) => {
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [internalPage, setInternalPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<MyResponseSortOrder>('desc');
  const [sortField, setSortField] = useState<MyResponseSortField>('createdAt');
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  const isControlledPagination =
    controlledPage !== undefined && onPageChange !== undefined;

  const page = isControlledPagination ? controlledPage : internalPage;

  const sortedApplications = useMemo(
    () => sortMyResponses(applications, sortField, sortOrder),
    [applications, sortField, sortOrder]
  );

  const selectedApplication = useMemo(
    () =>
      applications.find(application => application.id === selectedApplicationId) ??
      null,
    [applications, selectedApplicationId]
  );

  const selectedTaskId = useMemo(() => {
    const postId = selectedApplication?.post?.id ?? '';
    if (!postId) return null;
    return taskByPostId?.get(postId)?.id ?? null;
  }, [selectedApplication, taskByPostId]);

  const paginationCount = serverPagination
    ? (total ?? sortedApplications.length)
    : sortedApplications.length;

  const pageCount = Math.max(1, Math.ceil(paginationCount / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);

  const visibleApplications = useMemo(() => {
    if (!paginated || serverPagination) return sortedApplications;

    const start = currentPage * rowsPerPage;

    return sortedApplications.slice(start, start + rowsPerPage);
  }, [
    sortedApplications,
    paginated,
    serverPagination,
    currentPage,
    rowsPerPage,
  ]);

  const showPagination = paginated && !forPrint && paginationCount > 0;

  const scrollTableToTop = () => {
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

    if (!forPrint) {
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

  const handleSort = (field: MyResponseSortField) => {
    if (forPrint) return;

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
      field === 'post' || field === 'company' || field === 'status'
        ? 'asc'
        : 'desc'
    );
  };

  const getSortDirection = (field: MyResponseSortField) =>
    sortField === field ? sortOrder : false;

  const columnCellSx = (width: string | number) => ({
    p: 3,
    width,
    maxWidth: width,
    overflow: 'hidden',
    boxSizing: 'border-box' as const,
  });

  return (
    <Box
      className={forPrint ? 'print-table' : undefined}
      sx={{
        flex: 1,
        width: '100%',
        minHeight: 0,
        height: forPrint ? 'auto' : '100%',
        display: 'flex',
        bgcolor: 'white',
        overflow: forPrint ? 'visible' : 'hidden',
        flexDirection: 'column',
        borderRadius: forPrint ? 0 : { xs: '16px', md: '32px' },
        border: forPrint
          ? 'none'
          : theme => `1px solid ${theme.palette.secondary.main}`,
      }}
    >
      <TableContainer
        ref={tableContainerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          ...(forPrint && { overflow: 'visible' }),
        }}
      >
        <Table stickyHeader={!forPrint}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.post)}
              >
                <TableSortLabel
                  active={sortField === 'post'}
                  direction={getSortDirection('post') || 'asc'}
                  onClick={() => handleSort('post')}
                >
                  Объявление
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.company)}
              >
                <TableSortLabel
                  active={sortField === 'company'}
                  direction={getSortDirection('company') || 'asc'}
                  onClick={() => handleSort('company')}
                >
                  Компания
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.status)}
              >
                <TableSortLabel
                  active={sortField === 'status'}
                  direction={getSortDirection('status') || 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Статус
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.message)}
              >
                Сообщение
              </TableCell>
              <TableCell
                sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.createdAt)}
              >
                <TableSortLabel
                  active={sortField === 'createdAt'}
                  direction={getSortDirection('createdAt') || 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Отправлен
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.updatedAt)}
              >
                <TableSortLabel
                  active={sortField === 'updatedAt'}
                  direction={getSortDirection('updatedAt') || 'asc'}
                  onClick={() => handleSort('updatedAt')}
                  hideSortIcon={forPrint}
                  sx={forPrint ? { pointerEvents: 'none' } : undefined}
                >
                  Обновлён
                </TableSortLabel>
              </TableCell>
              {!forPrint && (
                <TableCell
                  sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.actions)}
                >
                  Действия
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleApplications.map(application => {
              const postId = application.post?.id ?? '';
              const taskId = postId
                ? (taskByPostId?.get(postId)?.id ?? null)
                : null;

              return (
                <TableRow
                  key={application.id}
                  hover={!forPrint}
                  sx={{ cursor: forPrint ? 'default' : 'pointer' }}
                  onClick={() => {
                    if (forPrint) return;
                    setSelectedApplicationId(application.id);
                  }}
                >
                  <TableCell
                    sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.post)}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {application.post?.title ?? 'Объявление'}
                    </Typography>
                  </TableCell>

                  <TableCell
                    sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.company)}
                  >
                    <Box
                      onClick={event => {
                        event.stopPropagation();
                        const ownerId =
                          application.post?.ownerId ??
                          application.post?.owner?.id;
                        if (ownerId) {
                          navigate(`${ROUTES.PROFILE}?userId=${ownerId}`);
                        }
                      }}
                    >
                      <UserDisplayName
                        user={application.post?.owner as Partial<User>}
                        variant="body2"
                      />
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.status)}
                  >
                    <Chip
                      size="small"
                      label={APPLICATION_STATUS_LABELS[application.status]}
                      color={getMyResponseStatusColor(application.status)}
                      sx={{ opacity: 0.9 }}
                    />
                  </TableCell>

                  <TableCell
                    sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.message)}
                  >
                    <Tooltip title={application.message || ''}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {application.message || '—'}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  <TableCell
                    sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.createdAt)}
                  >
                    <Typography variant="body2">
                      {format(new Date(application.createdAt), 'dd MMM yyyy', {
                        locale: ru,
                      })}
                    </Typography>
                  </TableCell>

                  <TableCell
                    sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.updatedAt)}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {formatDistanceToNow(new Date(application.updatedAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </Typography>
                  </TableCell>

                  {!forPrint && (
                    <TableCell
                      sx={columnCellSx(MY_RESPONSE_TABLE_COLUMN_WIDTHS.actions)}
                    >
                      <ResponseRowActions
                        application={application}
                        taskId={taskId}
                        withdrawingId={withdrawingId}
                        onWithdraw={onWithdraw}
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
          rowsPerPageOptions={[rowsPerPage]}
          onPageChange={handlePageChange}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} из ${count !== -1 ? count : `больше чем ${to}`}`
          }
          sx={{
            borderTop: theme => `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        />
      )}

      {selectedApplication && (
        <MyResponseDetailsDialog
          open
          application={selectedApplication}
          taskId={selectedTaskId}
          withdrawingId={withdrawingId}
          onClose={() => setSelectedApplicationId(null)}
          onWithdraw={onWithdraw}
        />
      )}
    </Box>
  );
};
