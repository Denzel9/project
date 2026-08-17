import { Add, Close, Search, SearchOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  TASK_STATUS_LABELS,
  type Task,
  type TaskStatus,
} from '@/entities/task';
import { getTaskConfig } from '@/features';

import {
  filterChatAddTaskTasks,
  getChatTaskLabel,
  type ChatAddTaskFilters,
  type ChatAddTaskStatusFilter,
} from '../model/utils';

type ChatAddTaskDialogProps = {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  peerName?: string;
  isLoading?: boolean;
  addingTaskId?: string | null;
  error?: string | null;
  onAddTask?: (task: Task) => void;
};

const DEFAULT_FILTERS: ChatAddTaskFilters = {
  query: '',
  status: 'all',
  date: '',
};

const CONTENT_MIN_HEIGHT = 380;
const PAGE_SIZE = 20;

export const ChatAddTaskDialog = ({
  open,
  onClose,
  tasks,
  peerName,
  isLoading = false,
  addingTaskId = null,
  error = null,
  onAddTask,
}: ChatAddTaskDialogProps) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<ChatAddTaskFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const isSending = Boolean(addingTaskId);

  const handleClose = useCallback(() => {
    if (isSending) {
      return;
    }

    setFilters(DEFAULT_FILTERS);
    setPage(0);
    onClose();
  }, [isSending, onClose]);

  const updateFilters = useCallback(
    (updater: (current: ChatAddTaskFilters) => ChatAddTaskFilters) => {
      setFilters(updater);
      setPage(0);
    },
    [],
  );

  const filteredTasks = useMemo(
    () => filterChatAddTaskTasks(tasks, filters),
    [filters, tasks]
  );

  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);

  const paginatedTasks = useMemo(() => {
    const start = currentPage * PAGE_SIZE;

    return filteredTasks.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredTasks]);

  const showPagination = filteredTasks.length > PAGE_SIZE;

  const handlePageChange = useCallback((_event: unknown, nextPage: number) => {
    setPage(nextPage);
    tableContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const hasTasks = tasks.length > 0;
  const hasFilteredTasks = filteredTasks.length > 0;
  const hasActiveFilters =
    Boolean(filters.query.trim()) ||
    filters.status !== 'all' ||
    Boolean(filters.date);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(0);
  }, []);

  const tableShellSx = useMemo(
    () => ({
      flex: 1,
      minHeight: CONTENT_MIN_HEIGHT,
      maxHeight: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      borderRadius: '20px',
      border: `1px solid ${theme.palette.secondary.main}`,
      bgcolor: 'background.paper',
      overflow: 'hidden',
      boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.06)}`,
    }),
    [theme]
  );

  const tableScrollSx = {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
  };

  const renderEmptyState = (message: string, withIcon = false) => (
    <Box
      sx={{
        ...tableShellSx,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 3,
      }}
    >
      <Stack
        spacing={1.5}
        sx={{ alignItems: 'center' }}
      >
        {withIcon && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'secondary.light',
              color: 'text.secondary',
            }}
          >
            <SearchOff />
          </Box>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}
        >
          {message}
        </Typography>
        {withIcon && hasActiveFilters && (
          <Chip
            label="Сбросить"
            variant="outlined"
            onClick={resetFilters}
            sx={{ flexShrink: 0, mt: 0.5 }}
          />
        )}
      </Stack>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (isSending && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
          return;
        }

        handleClose();
      }}
      sx={{
        '& .MuiDialog-paper': {
          m: 0,
          p: 2,
          width: '100%',
          borderRadius: { xs: 0, md: '32px' },
          maxWidth: { md: 820, xs: '100%' },
          minHeight: { md: 560, xs: '100%' },
          maxHeight: { md: '90vh', xs: '100%' },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'scroll',
          position: 'relative',
        },
      }}
    >
      {isSending && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '32px',
            bgcolor: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(2px)',
          }}
        >
          <Stack
            spacing={1.5}
            sx={{ alignItems: 'center', px: 3 }}
          >
            <CircularProgress size={36} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', fontWeight: 500 }}
            >
              Отправка ТЗ в чат…
            </Typography>
          </Stack>
        </Box>
      )}

      <Stack
        direction="row"
        sx={{
          mb: 2.5,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Добавить ТЗ
          </Typography>

          {peerName && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              Задачи, на которые назначен {peerName}
            </Typography>
          )}
        </Box>

        <IconButton
          aria-label="Закрыть"
          onClick={handleClose}
          disabled={isSending}
          sx={{
            bgcolor: 'secondary.light',
            '&:hover': { bgcolor: 'secondary.main' },
          }}
        >
          <Close />
        </IconButton>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: '16px' }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: '20px',
          bgcolor: 'secondary.light',
          border: theme => `1px solid ${theme.palette.secondary.main}`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
        >
          <TextField
            size="small"
            label="Поиск по названию"
            value={filters.query}
            onChange={event =>
              updateFilters(current => ({ ...current, query: event.target.value }))
            }
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              flex: 1.4,
              minWidth: 0,
              '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' },
            }}
          />

          <TextField
            select
            size="small"
            label="Статус"
            value={filters.status}
            onChange={event =>
              updateFilters(current => ({
                ...current,
                status: event.target.value as ChatAddTaskStatusFilter,
              }))
            }
            sx={{
              flex: 1,
              minWidth: 160,
              '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' },
            }}
          >
            <MenuItem value="all">Все</MenuItem>
            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map(status => (
              <MenuItem
                key={status}
                value={status}
              >
                {TASK_STATUS_LABELS[status]}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            type="date"
            label="Дата создания"
            value={filters.date}
            onChange={event =>
              updateFilters(current => ({ ...current, date: event.target.value }))
            }
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              flex: 1,
              minWidth: 160,
              '& .MuiOutlinedInput-root': { bgcolor: 'background.paper' },
            }}
          />
        </Stack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 1.5, alignItems: 'center', minHeight: 28 }}
      >
        {hasActiveFilters && (
          <>
            <Chip
              size="small"
              label="Фильтры активны"
              color="primary"
              variant="outlined"
            />
            <Chip
              label="Сбросить"
              variant="outlined"
              onClick={resetFilters}
              sx={{ flexShrink: 0, ml: 'auto !important' }}
            />
          </>
        )}
      </Stack>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        {isLoading && (
          <Box
            sx={{
              ...tableShellSx,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {!isLoading &&
          !hasTasks &&
          renderEmptyState('Нет задач, на которые назначен собеседник')}

        {!isLoading &&
          hasTasks &&
          !hasFilteredTasks &&
          renderEmptyState('По выбранным фильтрам задач не найдено', true)}

        {!isLoading && hasTasks && hasFilteredTasks && (
          <Box sx={tableShellSx}>
            <TableContainer
              ref={tableContainerRef}
              sx={tableScrollSx}
            >
              <Table
                stickyHeader
                sx={{
                  '& .MuiTableCell-head': {
                    fontWeight: 600,
                    fontSize: 13,
                    color: 'text.secondary',
                    bgcolor: 'secondary.light',
                    borderBottom: theme =>
                      `1px solid ${theme.palette.secondary.main}`,
                    py: 1.5,
                  },
                  '& .MuiTableCell-root': {
                    py: 1.75,
                    px: 2,
                    borderBottom: theme =>
                      `1px solid ${alpha(theme.palette.secondary.main, 0.6)}`,
                  },
                  '& .MuiTableRow-root:last-child .MuiTableCell-root': {
                    borderBottom: 0,
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Название</TableCell>
                    <TableCell sx={{ width: 150 }}>Статус</TableCell>
                    <TableCell sx={{ width: 120 }}>Дата</TableCell>
                    <TableCell
                      align="right"
                      sx={{ width: 130 }}
                    />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedTasks.map((task, index) => {
                    const taskConfig = getTaskConfig(task.status);
                    const rowIndex = currentPage * PAGE_SIZE + index;

                    return (
                      <TableRow
                        key={task.id}
                        hover
                        sx={{
                          bgcolor:
                            rowIndex % 2 === 1
                              ? 'secondary.light'
                              : 'background.paper',
                          '&:hover': {
                            bgcolor: theme =>
                              alpha(theme.palette.primary.main, 0.06),
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500 }}
                          >
                            {getChatTaskLabel(task)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={TASK_STATUS_LABELS[task.status]}
                            color={taskConfig?.color ?? 'default'}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {format(new Date(task.createdAt), 'dd.MM.yyyy')}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            type="button"
                            size="small"
                            variant="contained"
                            startIcon={
                              addingTaskId === task.id ? (
                                <CircularProgress
                                  size={14}
                                  color="inherit"
                                />
                              ) : (
                                <Add />
                              )
                            }
                            disabled={isSending}
                            onClick={() => onAddTask?.(task)}
                            sx={{
                              px: 1.5,
                              py: 0.75,
                              minWidth: 108,
                              borderRadius: '12px',
                              boxShadow: 'none',
                              '&:hover': { boxShadow: 'none' },
                            }}
                          >
                            {addingTaskId === task.id ? 'Отправка…' : 'Добавить'}
                          </Button>
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
                count={filteredTasks.length}
                rowsPerPage={PAGE_SIZE}
                onPageChange={handlePageChange}
                rowsPerPageOptions={[PAGE_SIZE]}
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
        )}
      </Box>
    </Dialog>
  );
};
