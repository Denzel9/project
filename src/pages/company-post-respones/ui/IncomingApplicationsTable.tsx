import { Chat, Check, Close, Task } from '@mui/icons-material';
import {
  Avatar,
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
  useUpdateApplicationStatusMutation,
  type Application,
} from '@/entities/application';
import { APPLICATION_STATUS_ENUM } from '@/entities/application/model/utils';
import { applicantToUserPartial, UserDisplayName } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { ROUTES, scrollMainToTop } from '@/shared';
import {
  ConfirmDialog,
  IncomingApplicationDetailsDialog,
  useSnackbarStore,
} from '@/widgets';

import {
  APPLICATION_TABLE_COLUMN_WIDTHS,
  APPLICATION_TABLE_PAGE_SIZE,
} from '../model/constants';
import { getApplicationStatusColor, sortApplications } from '../model/utils';

import type {
  ApplicationSortField,
  ApplicationSortOrder,
} from '../model/types';

type IncomingApplicationsTableProps = {
  applications: Application[];
  total?: number;
  page?: number;
  forPrint?: boolean;
  paginated?: boolean;
  serverPagination?: boolean;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, nextPage: number) => void;
};

const ApplicationRowActions = ({
  application,
}: {
  application: Application;
}) => {
  const [isOpenRejectDialog, setIsOpenRejectDialog] = useState(false);
  const { setSnackbarOpen } = useSnackbarStore();
  const isPrime = useAuthStore(state => state.isPrime);
  const { mutateAsync: updateStatus, isPending } =
    useUpdateApplicationStatusMutation();

  const canRespond =
    application.status === APPLICATION_STATUS_ENUM.NEW ||
    application.status === APPLICATION_STATUS_ENUM.VIEWED;

  const handleAccept = async () => {
    await updateStatus({
      id: application.id,
      body: { status: APPLICATION_STATUS_ENUM.ACCEPTED },
    });
    setSnackbarOpen?.(
      true,
      isPrime
        ? 'Задача создана и переведена в статус «Подготовка»'
        : 'Отклик принят'
    );
  };

  if (!canRespond && application.status !== APPLICATION_STATUS_ENUM.ACCEPTED) {
    return null;
  }

  return (
    <>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ flexWrap: 'wrap', gap: 0.5 }}
        onClick={event => event.stopPropagation()}
      >
        {canRespond && (
          <Stack
            direction="row"
            spacing={1}
          >
            <IconButton
              color="error"
              disabled={isPending}
              onClick={() => setIsOpenRejectDialog(true)}
            >
              <Close />
            </IconButton>
            <IconButton
              color="success"
              disabled={isPending}
              onClick={() => void handleAccept()}
            >
              <Check />
            </IconButton>
          </Stack>
        )}

        {application.status === APPLICATION_STATUS_ENUM.ACCEPTED && (
          <Stack
            direction="row"
            spacing={1}
          >
            {isPrime && (
              <IconButton
                component={Link}
                to={`${ROUTES.TASK}/${application.post?.id}?userId=${application.applicant?.id ?? ''}`}
              >
                <Task />
              </IconButton>
            )}
            <IconButton
              component={Link}
              to={`${ROUTES.CHATS}?recipientId=${application.applicant?.id ?? ''}`}
            >
              <Chat />
            </IconButton>
          </Stack>
        )}
      </Stack>

      <ConfirmDialog
        title="Отклонить отклик"
        isOpen={isOpenRejectDialog}
        isPending={isPending}
        onClose={() => setIsOpenRejectDialog(false)}
        onSuccess={() => {
          void updateStatus({
            id: application.id,
            body: { status: APPLICATION_STATUS_ENUM.REJECTED },
          }).then(() => {
            setIsOpenRejectDialog(false);
            setSnackbarOpen?.(true, 'Отклик отклонён');
          });
        }}
        description="Вы уверены, что хотите отклонить отклик?"
      />
    </>
  );
};

export const IncomingApplicationsTable = ({
  applications,
  total,
  page: controlledPage,
  forPrint = false,
  paginated = true,
  serverPagination = false,
  rowsPerPage = APPLICATION_TABLE_PAGE_SIZE,
  onPageChange,
}: IncomingApplicationsTableProps) => {
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const [internalPage, setInternalPage] = useState(0);
  const [sortOrder, setSortOrder] = useState<ApplicationSortOrder>('desc');
  const [sortField, setSortField] = useState<ApplicationSortField>('createdAt');
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  const selectedApplication = useMemo(
    () =>
      applications.find(application => application.id === selectedApplicationId) ??
      null,
    [applications, selectedApplicationId]
  );

  const isControlledPagination =
    controlledPage !== undefined && onPageChange !== undefined;

  const page = isControlledPagination ? controlledPage : internalPage;

  const sortedApplications = useMemo(
    () => sortApplications(applications, sortField, sortOrder),
    [applications, sortField, sortOrder]
  );

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

  const handleSort = (field: ApplicationSortField) => {
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
      field === 'applicant' || field === 'post' || field === 'status'
        ? 'asc'
        : 'desc'
    );
  };

  const getSortDirection = (field: ApplicationSortField) =>
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
        bgcolor: 'background.paper',
        overflow: forPrint ? 'visible' : 'hidden',
        flexDirection: 'column',
        borderRadius: forPrint ? 0 : { xs: '16px', md: '24px' },
        border: forPrint ? 'none' : `1px solid`,
        borderColor: 'divider',
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
                sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.applicant)}
              >
                <TableSortLabel
                  active={sortField === 'applicant'}
                  direction={getSortDirection('applicant') || 'asc'}
                  onClick={() => handleSort('applicant')}
                >
                  Кандидат
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.post)}
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
                sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.status)}
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
                sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.message)}
              >
                Сообщение
              </TableCell>
              <TableCell
                sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.createdAt)}
              >
                <TableSortLabel
                  active={sortField === 'createdAt'}
                  direction={getSortDirection('createdAt') || 'asc'}
                  onClick={() => handleSort('createdAt')}
                >
                  Создан
                </TableSortLabel>
              </TableCell>
              <TableCell
                sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.updatedAt)}
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
                  sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.actions)}
                >
                  Действия
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleApplications.map(application => (
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
                  sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.applicant)}
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: 'center', minWidth: 0 }}
                    onClick={event => {
                      event.stopPropagation();
                      if (application.applicant?.id) {
                        navigate(
                          `${ROUTES.PROFILE}?userId=${application.applicant.id}`
                        );
                      }
                    }}
                  >
                    <Avatar
                      src={application.applicant?.avatar ?? undefined}
                      sx={{ width: 36, height: 36, flexShrink: 0 }}
                    />
                    <UserDisplayName
                      user={applicantToUserPartial(application.applicant)}
                      variant="body2"
                    />
                  </Stack>
                </TableCell>

                <TableCell
                  sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.post)}
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
                  sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.status)}
                >
                  <Chip
                    size="small"
                    label={APPLICATION_STATUS_LABELS[application.status]}
                    color={getApplicationStatusColor(application.status)}
                    sx={{ opacity: 0.9 }}
                  />
                </TableCell>

                <TableCell
                  sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.message)}
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
                  sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.createdAt)}
                >
                  <Typography variant="body2">
                    {format(new Date(application.createdAt), 'dd MMM yyyy', {
                      locale: ru,
                    })}
                  </Typography>
                </TableCell>

                <TableCell
                  sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.updatedAt)}
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
                    sx={columnCellSx(APPLICATION_TABLE_COLUMN_WIDTHS.actions)}
                  >
                    <ApplicationRowActions application={application} />
                  </TableCell>
                )}
              </TableRow>
            ))}
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
        <IncomingApplicationDetailsDialog
          open
          application={selectedApplication}
          onClose={() => setSelectedApplicationId(null)}
        />
      )}
    </Box>
  );
};
