import {
  Avatar,
  Box,
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
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { UserDisplayName } from '@/entities/user';
import { EmptyBlock, FilterAutocomplete, ROUTES } from '@/shared';

import { PARTNERS_TABLE_PAGE_SIZE } from '../model/constants';
import { formatRelativeTime, sortTaskContactRows } from '../model/utils';

import { PartnersColumnFilterButton } from './PartnersColumnFilterButton';
import { PartnersRowActionsMenu } from './PartnersRowActionsMenu';
import { partnersTableShellSx } from './PartnersTableSkeleton';

import type {
  PartnersSortOrder,
  PartnersUserColumnFilter,
  TaskContactRow,
  TaskContactSortField,
} from '../model/types';

type TaskContactsTableProps = {
  items: TaskContactRow[];
  contactColumnLabel: string;
  emptyMessage: string;
  interactionsColumnLabel?: string;
  total?: number;
  page?: number;
  rowsPerPage?: number;
  userFilter?: PartnersUserColumnFilter;
  onPageChange?: (event: unknown, nextPage: number) => void;
  onInteractionsClick?: (item: TaskContactRow) => void;
  onPublicationsClick?: (item: TaskContactRow) => void;
};

export const TaskContactsTable = ({
  items,
  contactColumnLabel,
  emptyMessage,
  interactionsColumnLabel = 'Взаимодействий',
  total,
  page: controlledPage,
  rowsPerPage = PARTNERS_TABLE_PAGE_SIZE,
  userFilter,
  onPageChange,
  onInteractionsClick,
  onPublicationsClick,
}: TaskContactsTableProps) => {
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] =
    useState<TaskContactSortField>('interactionsCount');
  const [sortOrder, setSortOrder] = useState<PartnersSortOrder>('desc');
  const [isFilterRowOpen, setIsFilterRowOpen] = useState(false);

  const isServerPagination =
    controlledPage !== undefined && onPageChange !== undefined;
  const hasActiveUserFilter = Boolean(
    userFilter && userFilter.value !== 'all',
  );

  const sortedItems = useMemo(
    () => sortTaskContactRows(items, sortField, sortOrder),
    [items, sortField, sortOrder],
  );

  const paginationCount = useMemo(() => {
    if (!isServerPagination) {
      return sortedItems.length;
    }

    const base = Math.max(total ?? 0, items.length);
    const pageIndex = controlledPage ?? 0;

    if (items.length >= rowsPerPage && base <= (pageIndex + 1) * rowsPerPage) {
      return (pageIndex + 1) * rowsPerPage + 1;
    }

    return base;
  }, [
    isServerPagination,
    sortedItems.length,
    total,
    items.length,
    controlledPage,
    rowsPerPage,
  ]);

  const pageCount = Math.max(1, Math.ceil(paginationCount / rowsPerPage));
  const currentPage = Math.min(controlledPage ?? 0, pageCount - 1);

  const visibleItems = useMemo(() => {
    if (isServerPagination) {
      return sortedItems;
    }

    const start = currentPage * rowsPerPage;

    return sortedItems.slice(start, start + rowsPerPage);
  }, [sortedItems, isServerPagination, currentPage, rowsPerPage]);

  const showPagination = isServerPagination
    ? paginationCount > rowsPerPage || items.length >= rowsPerPage
    : paginationCount > rowsPerPage;

  const isEmpty = !items.length && (!isServerPagination || paginationCount === 0);
  const showTableShell = Boolean(userFilter) || !isEmpty;

  const handleSort = (field: TaskContactSortField) => {
    if (sortField === field) {
      setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortOrder(field === 'name' ? 'asc' : 'desc');
  };

  const getSortDirection = (field: TaskContactSortField) =>
    sortField === field ? sortOrder : false;

  const handlePageChange = (event: unknown, nextPage: number) => {
    onPageChange?.(event, nextPage);
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isEmpty && !showTableShell) {
    return (
      <Box
        sx={{
          ...partnersTableShellSx,
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          py: 8,
        }}
      >
        <EmptyBlock
          title={emptyMessage}
          description={
            isServerPagination
              ? 'Появятся после отклика на ваше объявление'
              : undefined
          }
        />
      </Box>
    );
  }

  return (
    <Box
      className="partners-print-table"
      sx={partnersTableShellSx}
    >
      <TableContainer
        ref={tableContainerRef}
        sx={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          scrollbarWidth: 'thin',
        }}
      >
        <Table sx={{ '& .MuiTableCell-root': { p: 3 } }}>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={getSortDirection('name')}>
                <Stack
                  spacing={0}
                  direction="row"
                  sx={{ alignItems: 'center' }}
                >
                  <TableSortLabel
                    active={sortField === 'name'}
                    direction={sortField === 'name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    {contactColumnLabel}
                  </TableSortLabel>

                  {userFilter && (
                    <PartnersColumnFilterButton
                      title={userFilter.label}
                      open={isFilterRowOpen}
                      active={hasActiveUserFilter}
                      onClick={() => setIsFilterRowOpen(open => !open)}
                    />
                  )}
                </Stack>
              </TableCell>

              <TableCell sortDirection={getSortDirection('interactionsCount')}>
                <TableSortLabel
                  active={sortField === 'interactionsCount'}
                  direction={
                    sortField === 'interactionsCount' ? sortOrder : 'asc'
                  }
                  onClick={() => handleSort('interactionsCount')}
                >
                  {interactionsColumnLabel}
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('publicationsCount')}>
                <TableSortLabel
                  active={sortField === 'publicationsCount'}
                  direction={
                    sortField === 'publicationsCount' ? sortOrder : 'asc'
                  }
                  onClick={() => handleSort('publicationsCount')}
                >
                  Публикации
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('lastInteractionAt')}>
                <TableSortLabel
                  active={sortField === 'lastInteractionAt'}
                  direction={
                    sortField === 'lastInteractionAt' ? sortOrder : 'asc'
                  }
                  onClick={() => handleSort('lastInteractionAt')}
                >
                  Последнее взаимодействие
                </TableSortLabel>
              </TableCell>

              <TableCell
                className="partners-no-print"
                align="right"
                sx={{ width: 56 }}
              />
            </TableRow>

            {userFilter && isFilterRowOpen && (
              <TableRow className="partners-no-print">
                <TableCell>
                  <Box onClick={event => event.stopPropagation()}>
                    <FilterAutocomplete
                      size="small"
                      variant="standard"
                      value={userFilter.value}
                      options={userFilter.options}
                      selectedOption={userFilter.selectedOption}
                      placeholder={
                        userFilter.placeholder ?? `Все ${userFilter.label.toLowerCase()}`
                      }
                      loading={userFilter.loading}
                      minInputLength={userFilter.minInputLength}
                      onSearch={userFilter.onSearch}
                      onChange={userFilter.onChange}
                    />
                  </Box>
                </TableCell>
                <TableCell />
                <TableCell />
                <TableCell />
                <TableCell className="partners-no-print" />
              </TableRow>
            )}
          </TableHead>

          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{ py: 8, border: 0 }}
                >
                  <EmptyBlock
                    title={
                      hasActiveUserFilter
                        ? 'Ничего не найдено'
                        : emptyMessage
                    }
                    description={
                      hasActiveUserFilter
                        ? 'Попробуйте изменить фильтр'
                        : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              visibleItems.map(item => (
                <TableRow
                  key={item.id}
                  hover
                  onClick={() =>
                    navigate(`${ROUTES.PROFILE}?userId=${item.id}`)
                  }
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'secondary.light' },
                  }}
                >
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center', minWidth: 180 }}
                    >
                      <Avatar
                        className="partners-no-print"
                        src={item.avatar || undefined}
                        sx={{ width: 36, height: 36 }}
                      >
                        {item.name.charAt(0)}
                      </Avatar>

                      <UserDisplayName
                        user={{ id: item.id }}
                        name={item.name}
                        variant="body2"
                      />
                    </Stack>
                  </TableCell>

                  <TableCell
                    onClick={
                      onInteractionsClick
                        ? event => {
                          event.stopPropagation();
                          onInteractionsClick(item);
                        }
                        : undefined
                    }
                    sx={
                      onInteractionsClick
                        ? {
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontWeight: 600,
                          '&:hover': { textDecoration: 'underline' },
                        }
                        : undefined
                    }
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      sx={
                        onInteractionsClick
                          ? { color: 'inherit', fontWeight: 'inherit' }
                          : undefined
                      }
                    >
                      {item.interactionsCount}
                    </Typography>
                  </TableCell>

                  <TableCell
                    onClick={
                      onPublicationsClick
                        ? event => {
                          event.stopPropagation();
                          onPublicationsClick(item);
                        }
                        : undefined
                    }
                    sx={
                      onPublicationsClick
                        ? {
                          cursor: 'pointer',
                          color: 'primary.main',
                          fontWeight: 600,
                          '&:hover': { textDecoration: 'underline' },
                        }
                        : undefined
                    }
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      sx={
                        onPublicationsClick
                          ? { color: 'inherit', fontWeight: 'inherit' }
                          : undefined
                      }
                    >
                      {item.publicationsCount}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      {formatRelativeTime(item.lastInteractionAt)}
                    </Typography>
                  </TableCell>

                  <TableCell
                    className="partners-no-print"
                    align="right"
                    onClick={event => event.stopPropagation()}
                  >
                    <PartnersRowActionsMenu userId={item.id} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && !isEmpty && (
        <TablePagination
          component="div"
          className="partners-no-print"
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
