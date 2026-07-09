import {
  AssignmentOutlined,
  FilterList,
  MoreVert,
  Whatshot,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router';

import { TASK_STATUS_LABELS, useTasksQuery, type TaskStatus } from '@/entities';
import { toDashboardTasksQueryParams } from '@/features';
import { TaskTable } from '@/pages/my-tasks/ui/TaskTable';
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { DASHBOARD_TABLE_PAGE_SIZE } from '../model/constants';
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
  const navigate = useNavigate();
  const { setSnackbarOpen } = useSnackbarStore();

  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [taskIdFilter, setTaskIdFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const isMenuOpen = Boolean(menuAnchor);

  const filterKey = useMemo(
    () =>
      [statusFilter, taskIdFilter, personFilter, urgentOnly, isCompany].join(
        '|',
      ),
    [statusFilter, taskIdFilter, personFilter, urgentOnly, isCompany],
  );

  const [pageState, setPageState] = useState({ filterKey, page: 0 });
  const page =
    pageState.filterKey === filterKey ? pageState.page : 0;

  const queryParams = useMemo(
    () =>
      toDashboardTasksQueryParams(
        {
          isCompany,
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(personFilter !== 'all' && { personId: personFilter }),
          urgentOnly,
        },
        { page: page + 1, limit: DASHBOARD_TABLE_PAGE_SIZE },
      ),
    [isCompany, statusFilter, personFilter, urgentOnly, page],
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
    [tasks, taskIdFilter],
  );

  const taskOptions = useMemo(() => getDashboardTaskOptions(tasks), [tasks]);

  const personOptions = useMemo(
    () => getDashboardTaskPersonOptions(tasks, isCompany),
    [tasks, isCompany],
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

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleStubAction = (message: string) => {
    handleMenuClose();
    setSnackbarOpen(true, message);
  };

  const countLabel = String(total);

  const handlePageChange = (_: unknown, nextPage: number) => {
    setPageState({ filterKey, page: nextPage });
  };

  return (
    <Box
      sx={{
        width: '100%',
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
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{
          mb: 1.5,
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
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
                Требуют внимания
              </Typography>

              {!isLoading && !isError && total > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={countLabel}
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              color="info"
              sx={{ lineHeight: 1.7, display: 'block' }}
            >
              Дедлайн сегодня и задачи, ожидающие вашего действия
            </Typography>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ alignItems: 'center', flexShrink: 0 }}
        >
          <IconButton
            aria-label="Фильтры"
            aria-pressed={isOpenFilter}
            onClick={() => setIsOpenFilter(current => !current)}
            color={hasActiveFilters ? 'primary' : 'default'}
          >
            <FilterList />
          </IconButton>

          <IconButton
            onClick={handleMenuOpen}
            aria-label="Действия"
          >
            <MoreVert />
          </IconButton>
        </Stack>
      </Stack>

      {isOpenFilter && (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 1.5,
            p: 1.25,
            width: '100%',
            flexShrink: 0,
            borderRadius: '16px',
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: 56,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: { xs: '100%', md: '75%' }, flexWrap: 'wrap', gap: 1 }}
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

            <IconButton
              onClick={() => setUrgentOnly(current => !current)}
              sx={{ flexShrink: 0, alignSelf: 'center' }}
            >
              <Whatshot color={urgentOnly ? 'error' : 'action'} />
            </IconButton>
          </Stack>

          {hasActiveFilters && (
            <Button
              size="small"
              onClick={handleResetFilters}
              sx={{
                flexShrink: 0,
                alignSelf: { xs: 'flex-start', md: 'center' },
              }}
            >
              Сбросить
            </Button>
          )}
        </Stack>
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
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TaskTable
            embedded
            page={page}
            total={total}
            isCompany={isCompany}
            tasks={visibleTasks}
            serverPagination
            onPageChange={handlePageChange}
            rowsPerPage={DASHBOARD_TABLE_PAGE_SIZE}
          />
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 4,
            borderRadius: '16px',
            bgcolor: 'grey.50',
            border: '1px dashed',
            borderColor: 'divider',
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

      <Menu
        open={isMenuOpen}
        anchorEl={menuAnchor}
        onClose={handleMenuClose}
      >
        <MenuItem
          component={RouterLink}
          to={ROUTES.MY_TASKS}
          onClick={handleMenuClose}
        >
          Все задачи
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleMenuClose();
            navigate(ROUTES.CALENDAR);
          }}
        >
          Календарь
        </MenuItem>

        <MenuItem
          onClick={() =>
            handleStubAction('Экспорт списка скоро будет доступен')
          }
        >
          Экспорт списка
        </MenuItem>

        <MenuItem
          onClick={() => handleStubAction('Печать скоро будет доступна')}
        >
          Печать
        </MenuItem>

        <MenuItem
          onClick={() =>
            handleStubAction('Настройка уведомлений скоро будет доступна')
          }
        >
          Уведомления по дедлайнам
        </MenuItem>
      </Menu>
    </Box>
  );
};
