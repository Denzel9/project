import { MoreVert, Whatshot } from '@mui/icons-material';
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router';

import { useUpdatePostMutation, type Post } from '@/entities';
import { useRequireEmailConfirmed } from '@/features';
import {
  TASK_TABLE_MIN_WIDTH,
  TASK_TABLE_PAGE_SIZE,
} from '@/pages/my-tasks/model/constants/constants';
import {
  columnCellSx as getColumnCellSx,
  filterCellSx as getFilterCellSx,
  headerCellSx as getHeaderCellSx,
  filteredColumnLabelSx,
  type TaskTableCellOptions,
} from '@/pages/my-tasks/model/styles';
import { ColumnDateFilter } from '@/pages/my-tasks/ui/ColumnDateFilter';
import { ColumnFilterButton } from '@/pages/my-tasks/ui/ColumnFilterButton';
import { EmptyBlock, ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

export type ArchivedPostColumnFilters = {
  q: string;
  urgentOnly: boolean;
  isPrivate: 'all' | 'true' | 'false';
  createdDate: string | null;
  deadlineDate: string | null;
  onQChange: (value: string) => void;
  onUrgentOnlyChange: (value: boolean) => void;
  onIsPrivateChange: (value: 'all' | 'true' | 'false') => void;
  onCreatedDateChange: (value: string | null) => void;
  onDeadlineDateChange: (value: string | null) => void;
};

type ArchivedPostTableProps = {
  posts: Post[];
  total?: number;
  page?: number;
  serverPagination?: boolean;
  paginated?: boolean;
  forPrint?: boolean;
  emptyText?: string;
  columnFilters?: ArchivedPostColumnFilters;
  onPageChange?: (event: unknown, nextPage: number) => void;
};

type PostSortField = 'title' | 'access' | 'createdAt' | 'updatedAt' | 'deadline';
type SortOrder = 'asc' | 'desc';

const COLUMN_WIDTHS = {
  title: '28%',
  access: '12%',
  createdAt: '16%',
  updatedAt: '16%',
  deadline: '12%',
  actions: '10%',
} as const;

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return format(date, 'dd.MM.yyyy HH:mm');
};

const formatRelative = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  if (isToday(date)) return format(date, 'HH:mm');
  return formatDistanceToNow(date, { addSuffix: true, locale: ru });
};

const PostRowActions = ({ post }: { post: Post }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const { mutateAsync: updatePost, isPending } = useUpdatePostMutation();
  const { setSnackbarOpen } = useSnackbarStore();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <IconButton
        size="small"
        className="print-no-print"
        onClick={(event: MouseEvent<HTMLElement>) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
        onClick={event => event.stopPropagation()}
      >
        <MenuItem
          disabled={isPending}
          sx={{ fontSize: 14 }}
          onClick={() => {
            closeMenu();
            if (!requireEmailConfirmed()) return;
            void updatePost({ id: post.id, body: { isArchived: false } }).then(
              () => setSnackbarOpen?.(true, 'Пост возвращен из архива'),
            );
          }}
        >
          Вернуть из архива
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          sx={{ fontSize: 14 }}
          onClick={() => {
            closeMenu();
            if (!requireEmailConfirmed()) return;
            navigate({
              pathname: ROUTES.MANAGE_APPLICATION,
              search: `?id=${post.id}`,
            });
          }}
        >
          Редактировать
        </MenuItem>
      </Menu>
    </>
  );
};

const HeaderWithFilter = ({
  label,
  isActive,
  forPrint,
  field,
  sortField,
  sortOrder,
  onSort,
  filter,
}: {
  label: string;
  isActive?: boolean;
  forPrint?: boolean;
  field: PostSortField;
  sortField: PostSortField;
  sortOrder: SortOrder;
  onSort: (field: PostSortField) => void;
  filter?: ReactNode;
}) => (
  <TableSortLabel
    active={sortField === field}
    direction={sortField === field ? sortOrder : 'asc'}
    onClick={() => onSort(field)}
    hideSortIcon={forPrint}
    sx={{
      ...(forPrint && { pointerEvents: 'none' }),
      ...(isActive && filteredColumnLabelSx),
    }}
  >
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', minWidth: 0, mr: 0.5 }}
    >
      {label}
      {filter}
    </Stack>
  </TableSortLabel>
);

export const ArchivedPostTable = ({
  posts,
  total,
  page = 0,
  serverPagination = false,
  paginated = true,
  forPrint = false,
  emptyText = 'Архивных постов нет',
  columnFilters,
  onPageChange,
}: ArchivedPostTableProps) => {
  const navigate = useNavigate();
  const showColumnFilters = Boolean(columnFilters) && !forPrint;
  const showActionsColumn = !forPrint;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRowRef = useRef<HTMLTableRowElement>(null);

  const [isFilterRowOpen, setIsFilterRowOpen] = useState(false);
  const [headerRowHeight, setHeaderRowHeight] = useState(56);
  const [sortField, setSortField] = useState<PostSortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useLayoutEffect(() => {
    if (!headerRowRef.current) return;
    setHeaderRowHeight(headerRowRef.current.getBoundingClientRect().height);
  }, [isFilterRowOpen, showColumnFilters]);

  const edgePadding = showActionsColumn ? '32px' : undefined;
  const compactSidePadding = showColumnFilters ? 1.5 : 3;
  const extraFirstPaddingPx = 16;

  const columnCellSx = (
    width: string | number,
    options?: TaskTableCellOptions,
  ) =>
    getColumnCellSx(
      width,
      false,
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
      false,
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

  const toggleFilterRow = () => {
    setIsFilterRowOpen(current => !current);
  };

  const handleSort = (field: PostSortField) => {
    if (sortField === field) {
      setSortOrder(current => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortOrder(field === 'title' || field === 'access' ? 'asc' : 'desc');
  };

  const sortedPosts = useMemo(() => {
    const items = [...posts];
    const direction = sortOrder === 'asc' ? 1 : -1;

    items.sort((a, b) => {
      if (sortField === 'title') {
        return (
          (a.title || '').localeCompare(b.title || '', 'ru', {
            sensitivity: 'base',
          }) * direction
        );
      }

      if (sortField === 'access') {
        const aValue = a.isPrivate ? 1 : 0;
        const bValue = b.isPrivate ? 1 : 0;
        return (aValue - bValue) * direction;
      }

      const aTime = new Date(
        sortField === 'createdAt'
          ? a.createdAt
          : sortField === 'deadline'
            ? (a.deadline ?? '')
            : a.updatedAt,
      ).getTime();
      const bTime = new Date(
        sortField === 'createdAt'
          ? b.createdAt
          : sortField === 'deadline'
            ? (b.deadline ?? '')
            : b.updatedAt,
      ).getTime();

      const aSafe = Number.isNaN(aTime) ? 0 : aTime;
      const bSafe = Number.isNaN(bTime) ? 0 : bTime;

      return (aSafe - bSafe) * direction;
    });

    return items;
  }, [posts, sortField, sortOrder]);

  const totalRows = total ?? posts.length;
  const showPagination = paginated && !forPrint && serverPagination;

  const hasActiveFilters = Boolean(
    columnFilters &&
    (Boolean(columnFilters.q.trim()) ||
      columnFilters.urgentOnly ||
      columnFilters.isPrivate !== 'all' ||
      Boolean(columnFilters.createdDate) ||
      Boolean(columnFilters.deadlineDate)),
  );

  // Без фильтров — пустой экран целиком. С фильтрами оставляем шапку.
  if (!posts.length && !forPrint && !hasActiveFilters) {
    return (
      <Stack
        sx={{
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: '24px',
          width: '100%',
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
            : sortedPosts.length
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
            <col style={{ width: COLUMN_WIDTHS.title }} />
            <col style={{ width: COLUMN_WIDTHS.access }} />
            <col style={{ width: COLUMN_WIDTHS.createdAt }} />
            <col style={{ width: COLUMN_WIDTHS.updatedAt }} />
            <col style={{ width: COLUMN_WIDTHS.deadline }} />
            {showActionsColumn && (
              <col style={{ width: COLUMN_WIDTHS.actions }} />
            )}
          </colgroup>

          <TableHead>
            <TableRow ref={headerRowRef}>
              <TableCell sx={headerCellSx(COLUMN_WIDTHS.title, { first: true })}>
                <HeaderWithFilter
                  label="Название"
                  field="title"
                  isActive={Boolean(columnFilters?.q.trim())}
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
                          title="Название"
                          open={isFilterRowOpen}
                          active={Boolean(columnFilters.q.trim())}
                          onClick={toggleFilterRow}
                        />
                        <Tooltip
                          title={
                            columnFilters.urgentOnly
                              ? 'Показать все посты'
                              : 'Только срочные'
                          }
                        >
                          <IconButton
                            size="small"
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

              <TableCell sx={headerCellSx(COLUMN_WIDTHS.access)}>
                <HeaderWithFilter
                  label="Доступ"
                  field="access"
                  isActive={columnFilters?.isPrivate !== 'all'}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  forPrint={forPrint}
                  onSort={handleSort}
                  filter={
                    showColumnFilters && columnFilters ? (
                      <ColumnFilterButton
                        title="Доступ"
                        open={isFilterRowOpen}
                        active={columnFilters.isPrivate !== 'all'}
                        onClick={toggleFilterRow}
                      />
                    ) : undefined
                  }
                />
              </TableCell>

              <TableCell sx={headerCellSx(COLUMN_WIDTHS.createdAt)}>
                <HeaderWithFilter
                  label="Создано"
                  field="createdAt"
                  isActive={Boolean(columnFilters?.createdDate)}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  forPrint={forPrint}
                  onSort={handleSort}
                  filter={
                    showColumnFilters && columnFilters ? (
                      <ColumnFilterButton
                        title="Создано"
                        open={isFilterRowOpen}
                        active={Boolean(columnFilters.createdDate)}
                        onClick={toggleFilterRow}
                      />
                    ) : undefined
                  }
                />
              </TableCell>

              <TableCell sx={headerCellSx(COLUMN_WIDTHS.updatedAt)}>
                <HeaderWithFilter
                  label="Обновлено"
                  field="updatedAt"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  forPrint={forPrint}
                  onSort={handleSort}
                />
              </TableCell>

              <TableCell sx={headerCellSx(COLUMN_WIDTHS.deadline)}>
                <HeaderWithFilter
                  label="Дедлайн"
                  field="deadline"
                  isActive={Boolean(columnFilters?.deadlineDate)}
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

              {showActionsColumn && <TableCell />}
            </TableRow>

            {showColumnFilters && columnFilters && (
              <TableRow>
                <TableCell
                  sx={filterCellSx(COLUMN_WIDTHS.title, { first: true })}
                >
                  {renderFilterCellContent(
                    <Box onClick={event => event.stopPropagation()}>
                      <TextField
                        size="small"
                        fullWidth
                        variant="standard"
                        placeholder="Поиск по названию"
                        value={columnFilters.q}
                        onChange={event =>
                          columnFilters.onQChange(event.target.value)
                        }
                      />
                    </Box>,
                  )}
                </TableCell>

                <TableCell sx={filterCellSx(COLUMN_WIDTHS.access)}>
                  {renderFilterCellContent(
                    <Box onClick={event => event.stopPropagation()}>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        variant="standard"
                        value={columnFilters.isPrivate}
                        onChange={event =>
                          columnFilters.onIsPrivateChange(
                            event.target.value as 'all' | 'true' | 'false',
                          )
                        }
                      >
                        <MenuItem value="all">Все</MenuItem>
                        <MenuItem value="false">Публичные</MenuItem>
                        <MenuItem value="true">Приватные</MenuItem>
                      </TextField>
                    </Box>,
                  )}
                </TableCell>

                <TableCell sx={filterCellSx(COLUMN_WIDTHS.createdAt)}>
                  {renderFilterCellContent(
                    <ColumnDateFilter
                      value={columnFilters.createdDate}
                      placeholder="Все даты"
                      todayLabel="Создано сегодня"
                      onChange={columnFilters.onCreatedDateChange}
                    />,
                  )}
                </TableCell>

                <TableCell sx={filterCellSx(COLUMN_WIDTHS.updatedAt)}>
                  {renderFilterCellContent(null)}
                </TableCell>

                <TableCell sx={filterCellSx(COLUMN_WIDTHS.deadline)}>
                  {renderFilterCellContent(
                    <ColumnDateFilter
                      value={columnFilters.deadlineDate}
                      placeholder="Все даты"
                      todayLabel="Дедлайн сегодня"
                      onChange={columnFilters.onDeadlineDateChange}
                    />,
                  )}
                </TableCell>

                {showActionsColumn && (
                  <TableCell
                    sx={filterCellSx(COLUMN_WIDTHS.actions, { actions: true })}
                  >
                    {renderFilterCellContent(null)}
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableHead>

          {sortedPosts.length > 0 && (
            <TableBody>
              {sortedPosts.map(post => (
                <TableRow
                  key={post.id}
                  hover={!forPrint}
                  sx={{ cursor: forPrint ? 'default' : 'pointer' }}
                  onClick={() => {
                    if (forPrint) return;
                    navigate(`${ROUTES.POST}/${post.id}`);
                  }}
                >
                  <TableCell sx={columnCellSx(COLUMN_WIDTHS.title, { first: true })}>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: 'center', minWidth: 0 }}
                    >
                      {post.urgent && (
                        <Whatshot
                          color="error"
                          sx={{ fontSize: 18, flexShrink: 0 }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ fontWeight: 500 }}
                      >
                        {post.title?.trim() || 'Без названия'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell sx={columnCellSx(COLUMN_WIDTHS.access)}>
                    <Typography variant="body2" noWrap>
                      {post.isPrivate ? 'Приватный' : 'Публичный'}
                    </Typography>
                  </TableCell>

                  <TableCell sx={columnCellSx(COLUMN_WIDTHS.createdAt)}>
                    <Typography
                      variant="body2"
                      noWrap
                      title={formatDateTime(post.createdAt)}
                    >
                      {formatRelative(post.createdAt)}
                    </Typography>
                  </TableCell>

                  <TableCell sx={columnCellSx(COLUMN_WIDTHS.updatedAt)}>
                    <Typography
                      variant="body2"
                      noWrap
                      title={formatDateTime(post.updatedAt)}
                    >
                      {formatRelative(post.updatedAt)}
                    </Typography>
                  </TableCell>

                  <TableCell sx={columnCellSx(COLUMN_WIDTHS.deadline)}>
                    <Typography variant="body2" noWrap>
                      {post.deadline
                        ? format(new Date(post.deadline), 'dd.MM.yyyy')
                        : '—'}
                    </Typography>
                  </TableCell>

                  {showActionsColumn && (
                    <TableCell
                      sx={columnCellSx(COLUMN_WIDTHS.actions, { actions: true })}
                      onClick={event => event.stopPropagation()}
                    >
                      <PostRowActions post={post} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {!sortedPosts.length && !forPrint && (
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
          className="print-no-print"
          count={totalRows}
          page={page}
          onPageChange={onPageChange ?? (() => undefined)}
          rowsPerPage={TASK_TABLE_PAGE_SIZE}
          rowsPerPageOptions={[TASK_TABLE_PAGE_SIZE]}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} из ${count !== -1 ? count : `более ${to}`}`
          }
        />
      )}
    </Box>
  );
};
