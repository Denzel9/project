import { BusinessOutlined } from '@mui/icons-material';
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
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { UserDisplayName } from '@/entities/user';
import { EmptyBlock, ROUTES } from '@/shared';

import { PARTNERS_TABLE_PAGE_SIZE } from '../model/constants';
import {
  formatRelativeTime,
  sortApplicationCompanyRows,
} from '../model/utils';

import { PartnersRowActionsMenu } from './PartnersRowActionsMenu';
import { partnersTableShellSx } from './PartnersTableSkeleton';

import type {
  ApplicationCompanyRow,
  ApplicationCompanySortField,
  PartnersSortOrder,
} from '../model/types';

type ApplicationCompaniesTableProps = {
  items: ApplicationCompanyRow[];
  emptyMessage: string;
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, nextPage: number) => void;
};

export const ApplicationCompaniesTable = ({
  items,
  emptyMessage,
  total,
  page: controlledPage,
  rowsPerPage = PARTNERS_TABLE_PAGE_SIZE,
  onPageChange,
}: ApplicationCompaniesTableProps) => {
  const navigate = useNavigate();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] =
    useState<ApplicationCompanySortField>('name');
  const [sortOrder, setSortOrder] = useState<PartnersSortOrder>('asc');

  const isServerPagination =
    controlledPage !== undefined && onPageChange !== undefined;

  const sortedItems = useMemo(
    () => sortApplicationCompanyRows(items, sortField, sortOrder),
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

  const handleSort = (field: ApplicationCompanySortField) => {
    if (sortField === field) {
      setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortField(field);
    setSortOrder(field === 'name' ? 'asc' : 'desc');
  };

  const getSortDirection = (field: ApplicationCompanySortField) =>
    sortField === field ? sortOrder : false;

  const handlePageChange = (event: unknown, nextPage: number) => {
    onPageChange?.(event, nextPage);
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!items.length && paginationCount === 0) {
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
        <EmptyBlock title={emptyMessage} />
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
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortOrder : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Компания
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('applicationsCount')}>
                <TableSortLabel
                  active={sortField === 'applicationsCount'}
                  direction={
                    sortField === 'applicationsCount' ? sortOrder : 'asc'
                  }
                  onClick={() => handleSort('applicationsCount')}
                >
                  Откликов
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('postsCount')}>
                <TableSortLabel
                  active={sortField === 'postsCount'}
                  direction={sortField === 'postsCount' ? sortOrder : 'asc'}
                  onClick={() => handleSort('postsCount')}
                >
                  Объявлений
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={getSortDirection('lastActivityAt')}>
                <TableSortLabel
                  active={sortField === 'lastActivityAt'}
                  direction={
                    sortField === 'lastActivityAt' ? sortOrder : 'asc'
                  }
                  onClick={() => handleSort('lastActivityAt')}
                >
                  Последний отклик
                </TableSortLabel>
              </TableCell>

              <TableCell
                className="partners-no-print"
                align="right"
                sx={{ width: 56 }}
              />
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleItems.map(item => (
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

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: 'center', minWidth: 0 }}
                    >
                      <UserDisplayName
                        user={item}
                        variant="body2"
                      />

                      <Chip
                        className="partners-no-print"
                        size="small"
                        variant="outlined"
                        icon={<BusinessOutlined />}
                        label="Компания"
                      />
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">
                    {item.applicationsCount}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{item.postsCount}</Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {formatRelativeTime(item.lastActivityAt)}
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
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
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
