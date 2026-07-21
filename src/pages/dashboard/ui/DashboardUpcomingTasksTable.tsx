import { AssignmentOutlined, FilterList, Whatshot } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { TASK_STATUS_LABELS, useTasksQuery, type TaskStatus } from '@/entities';
import { toDashboardTasksQueryParams } from '@/features';
import { TaskTable } from '@/pages/my-tasks/ui/TaskTable';

import {
  DASHBOARD_TABLE_PAGE_SIZE,
  MOBILE_DASHBOARD_TABLE_PAGE_SIZE,
} from '../model/constants';
import {
  getDashboardTaskOptions,
  getDashboardTaskPersonOptions,
} from '../model/utils';

type DashboardUpcomingTasksTableProps = {
  isCompany: boolean;
  onErrorChange?: (isError: boolean) => void;
};

export const DashboardUpcomingTasksTable = ({
  isCompany,
  onErrorChange,
}: DashboardUpcomingTasksTableProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [taskIdFilter, setTaskIdFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const filterKey = useMemo(
    () =>
      [statusFilter, taskIdFilter, personFilter, urgentOnly, isCompany].join(
        '|'
      ),
    [statusFilter, taskIdFilter, personFilter, urgentOnly, isCompany]
  );

  const [pageState, setPageState] = useState({ filterKey, page: 0 });
  const page = pageState.filterKey === filterKey ? pageState.page : 0;

  const queryParams = useMemo(
    () =>
      toDashboardTasksQueryParams(
        {
          isCompany,
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(personFilter !== 'all' && { personId: personFilter }),
          urgentOnly,
        },
        {
          page: page + 1,
          limit: isMobile
            ? MOBILE_DASHBOARD_TABLE_PAGE_SIZE
            : DASHBOARD_TABLE_PAGE_SIZE,
        }
      ),
    [isCompany, statusFilter, personFilter, urgentOnly, page, isMobile]
  );

  const { data, isLoading, isError } = useTasksQuery(queryParams);

  useEffect(() => {
    onErrorChange?.(isError);
  }, [isError, onErrorChange]);

  const tasks = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? 0;

  const visibleTasks = useMemo(
    () =>
      taskIdFilter === 'all'
        ? tasks
        : tasks.filter(task => task.id === taskIdFilter),
    [tasks, taskIdFilter]
  );

  const taskOptions = useMemo(() => getDashboardTaskOptions(tasks), [tasks]);

  const personOptions = useMemo(
    () => getDashboardTaskPersonOptions(tasks, isCompany),
    [tasks, isCompany]
  );

  const statusOptions = Object.entries(TASK_STATUS_LABELS);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setTaskIdFilter('all');
    setPersonFilter('all');
    setUrgentOnly(false);
  };

  const hasActiveFilters =
    statusFilter !== 'all' ||
    taskIdFilter !== 'all' ||
    personFilter !== 'all' ||
    urgentOnly;

  const emptyText =
    total > 0 && visibleTasks.length === 0
      ? 'Нет задач по выбранным фильтрам'
      : 'Нет задач с дедлайном на сегодня и ожидающих вашего действия';

  const countLabel = String(total);

  const handlePageChange = (_: unknown, nextPage: number) => {
    setPageState({ filterKey, page: nextPage });
  };

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        height: { xs: 'auto', lg: 600 },
        minHeight: { xs: 420, lg: 600 },
        display: 'flex',
        bgcolor: 'white',
        overflow: 'hidden',
        p: { xs: 2, md: 2.5 },
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', minWidth: 0 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              borderRadius: '12px',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'secondary.light',
              color: 'primary.main',
            }}
          >
            <AssignmentOutlined fontSize="small" />
          </Box>

          <Stack
            spacing={0}
            sx={{ minWidth: 0 }}
          >
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
            >
              <Typography
                variant="h6"
                sx={{ lineHeight: 1.2 }}
              >
                Текущие задачи
              </Typography>

              {!isLoading && !isError && total > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={countLabel}
                  sx={{ display: { xs: 'none', md: 'block' } }}
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              color="info"
              sx={{ lineHeight: 1.7, display: { xs: 'none', md: 'block' } }}
            >
              Дедлайн сегодня и задачи, ожидающие вашего действия
            </Typography>
          </Stack>
        </Stack>

        <IconButton
          aria-label="Фильтры"
          aria-pressed={isOpenFilter}
          onClick={() => setIsOpenFilter(current => !current)}
          color={hasActiveFilters ? 'primary' : 'default'}
        >
          <FilterList />
        </IconButton>
      </Stack>

      {isOpenFilter && (
        <Box
          sx={{
            mb: 1.5,
            p: 1.25,
            width: '100%',
            minHeight: 56,
            flexShrink: 0,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderRadius: '16px',
            alignItems: 'center',
            borderColor: 'divider',
            justifyContent: 'space-between',
          }}
        >
          <Stack
            spacing={1}
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              gap: 1,
              width: { xs: '100%', md: '75%' },
              alignItems: 'start',
            }}
          >
            <TextField
              select
              fullWidth
              size="small"
              label="Статус"
              value={statusFilter}
              onChange={event =>
                setStatusFilter(event.target.value as TaskStatus | 'all')
              }
              sx={{ minWidth: { xs: '100%', sm: 140 }, flex: 1 }}
            >
              <MenuItem value="all">Все статусы</MenuItem>
              {statusOptions.map(([value, label]) => (
                <MenuItem
                  key={value}
                  value={value}
                >
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Задача"
              value={taskIdFilter}
              onChange={event => setTaskIdFilter(event.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 160 }, flex: 1 }}
            >
              <MenuItem value="all">Все задачи</MenuItem>
              {taskOptions.map(option => (
                <MenuItem
                  key={option.id}
                  value={option.id}
                >
                  {option.title}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label={isCompany ? 'Исполнитель' : 'Заказчик'}
              value={personFilter}
              onChange={event => setPersonFilter(event.target.value)}
              sx={{ minWidth: { xs: '100%', sm: 160 }, flex: 1 }}
            >
              <MenuItem value="all">
                Все {isCompany ? 'исполнители' : 'заказчики'}
              </MenuItem>
              {personOptions.map(option => (
                <MenuItem
                  key={option.id}
                  value={option.id}
                >
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction="row">
              <IconButton onClick={() => setUrgentOnly(current => !current)}>
                <Whatshot color={urgentOnly ? 'error' : 'action'} />
              </IconButton>

              {hasActiveFilters && (
                <Button
                  size="small"
                  onClick={handleResetFilters}
                  sx={{
                    alignSelf: { xs: 'flex-start', md: 'center' },
                  }}
                >
                  Сбросить
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      {isLoading ? (
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              height={72}
              sx={{ borderRadius: '16px' }}
            />
          ))}
        </Stack>
      ) : visibleTasks.length > 0 ? (
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            '& .MuiTable-root': {
              minWidth: 720,
            },
          }}
        >
          <TaskTable
            embedded
            page={page}
            total={total}
            serverPagination
            tasks={visibleTasks}
            isCompany={isCompany}
            onPageChange={handlePageChange}
            rowsPerPage={
              isMobile
                ? MOBILE_DASHBOARD_TABLE_PAGE_SIZE
                : DASHBOARD_TABLE_PAGE_SIZE
            }
          />
        </Box>
      ) : (
        <Box
          sx={{
            py: 4,
            px: 2,
            flex: 1,
            display: 'flex',
            bgcolor: 'grey.50',
            alignItems: 'center',
            borderRadius: '16px',
            border: '1px dashed',
            borderColor: 'divider',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', maxWidth: 360 }}
          >
            {emptyText}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
