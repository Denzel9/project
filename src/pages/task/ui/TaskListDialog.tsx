import { Close, FolderOutlined, MoreVert, Search } from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';

import {
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  executorToUserPartial,
  getTaskStatusColor,
  getUserName,
  isTaskExecutor,
  isTaskOverdue,
  usePostTasksQuery,
  type Task,
  type TaskStatus,
} from '@/entities';
import { EmptyBlock } from '@/shared';

type TaskListTab = 'active' | 'archived' | 'completed' | 'cancelled';

const TAB_ITEMS: { value: TaskListTab; label: string }[] = [
  { value: 'active', label: 'Активные' },
  { value: 'archived', label: 'Архивные' },
  { value: 'completed', label: 'Завершенные' },
  { value: 'cancelled', label: 'Отменённые' },
];

const TAB_QUERY_PARAMS: Record<
  TaskListTab,
  {
    page: number;
    limit: number;
    isArchived?: boolean;
    active?: boolean;
    status?: TaskStatus;
  }
> = {
  active: { page: 1, limit: 100, isArchived: false, active: true },
  archived: { page: 1, limit: 100, isArchived: true },
  completed: {
    page: 1,
    limit: 100,
    isArchived: false,
    status: TASK_STATUS_ENUM.COMPLETED,
  },
  cancelled: {
    page: 1,
    limit: 100,
    isArchived: false,
    status: TASK_STATUS_ENUM.ANNULLED,
  },
};

const resolveTabForTask = (task?: Task | null): TaskListTab => {
  if (!task) return 'active';
  if (task.isArchived) return 'archived';
  if (task.status === TASK_STATUS_ENUM.ANNULLED) return 'cancelled';
  if (task.status === TASK_STATUS_ENUM.COMPLETED) return 'completed';
  return 'active';
};

type TaskListDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Если задан — вкладки и загрузка задач этого поста */
  postId?: string | null;
  tasks?: Task[];
  currentTaskId?: string;
  currentTask?: Task | null;
  isLoading?: boolean;
  title?: string;
  onSelectTask?: (task: Task) => void;
  /** Показывать исполнителя у пунктов списка */
  showExecutor?: boolean;
  currentUserId?: string | null;
  onRequestAnnulment?: (task: Task) => void;
  onRequestDeadlineExtension?: (task: Task) => void;
  /** `drawer` — боковая панель (чат), `dialog` — модалка (CRM) */
  variant?: 'dialog' | 'drawer';
};

const getExecutorLabel = (task: Task) =>
  getUserName(executorToUserPartial(task.executor)) || 'Не назначен';

const matchesTaskQuery = (task: Task, query: string) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return true;

  const haystack = [
    task.title || 'Без названия',
    task.post?.title,
    getExecutorLabel(task),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalized);
};

const formatDeadline = (finalDate: string | null) => {
  if (!finalDate) return null;

  const date = new Date(finalDate);

  if (Number.isNaN(date.getTime())) return null;

  return format(date, 'dd.MM.yyyy');
};

const TabCountBadge = ({
  count,
  isActive,
}: {
  count?: number;
  isActive: boolean;
}) => {
  if (count == null) return null;

  return (
    <Chip
      size="small"
      label={count}
      color={isActive ? 'primary' : 'default'}
      variant={isActive ? 'filled' : 'outlined'}
      sx={{
        height: 20,
        minWidth: 20,
        ml: 0.75,
        '& .MuiChip-label': { px: 0.75, fontSize: 11, fontWeight: 600 },
      }}
    />
  );
};

const canRequestTaskAction = (
  task: Task,
  currentUserId: string | null | undefined,
) =>
  Boolean(
    currentUserId &&
    !task.isArchived &&
    task.status !== TASK_STATUS_ENUM.ANNULLED &&
    task.status !== TASK_STATUS_ENUM.COMPLETED &&
    task.executorId &&
    (task.ownerId === currentUserId || isTaskExecutor(task, currentUserId)),
  );

const TaskListItem = ({
  task,
  isActive,
  onSelect,
  showExecutor = false,
  currentUserId,
  onRequestAnnulment,
  onRequestDeadlineExtension,
}: {
  task: Task;
  isActive: boolean;
  onSelect?: (task: Task) => void;
  showExecutor?: boolean;
  currentUserId?: string | null;
  onRequestAnnulment?: (task: Task) => void;
  onRequestDeadlineExtension?: (task: Task) => void;
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const deadlineLabel = formatDeadline(task.finalDate);
  const isOverdue = isTaskOverdue(task);
  const secondaryColor = isActive
    ? 'rgba(255,255,255,0.85)'
    : isOverdue && deadlineLabel
      ? 'error.main'
      : 'text.secondary';
  const canAct = canRequestTaskAction(task, currentUserId);
  const canRequestAnnulment = Boolean(
    canAct &&
    onRequestAnnulment &&
    task.annulment?.status !== 'PENDING',
  );
  const canRequestDeadlineExtension = Boolean(
    canAct &&
    onRequestDeadlineExtension &&
    task.deadlineExtension?.status !== 'PENDING',
  );
  const showRequestMenu = canRequestAnnulment || canRequestDeadlineExtension;

  const handleOpenMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleCloseMenu = (event?: MouseEvent) => {
    event?.stopPropagation();
    setMenuAnchor(null);
  };

  return (
    <Stack
      direction="row"
      spacing={1.5}
      onClick={onSelect ? () => onSelect(task) : undefined}
      sx={{
        p: 1.5,
        cursor: onSelect ? 'pointer' : 'default',
        borderRadius: '12px',
        alignItems: 'center',
        bgcolor: isActive ? 'primary.light' : 'transparent',
        '&:hover': {
          bgcolor: isActive ? 'primary.light' : 'action.hover',
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="body1"
          noWrap
          sx={{
            fontWeight: isActive ? 600 : 500,
            color: isActive ? 'common.white' : 'text.primary',
          }}
        >
          {task.title || 'Без названия'}
        </Typography>

        <Typography
          variant="caption"
          noWrap
          sx={{
            display: 'block',
            color: secondaryColor,
          }}
        >
          {deadlineLabel
            ? `${isOverdue ? 'Просрочено' : 'Дедлайн'} · ${deadlineLabel}`
            : 'Без дедлайна'}
        </Typography>

        {showExecutor && (
          <Typography
            variant="caption"
            noWrap
            sx={{
              display: 'block',
              color: isActive ? 'rgba(255,255,255,0.85)' : 'text.secondary',
            }}
          >
            {getExecutorLabel(task)}
          </Typography>
        )}
      </Box>

      <Chip
        size="small"
        color={getTaskStatusColor(task.status)}
        label={TASK_STATUS_LABELS[task.status]}
        sx={{
          height: 22,
          flexShrink: 0,
          '& .MuiChip-label': { px: 0.75, fontSize: 11 },
        }}
      />

      {showRequestMenu && (
        <>
          <IconButton
            size="small"
            aria-label="Действия по задаче"
            onClick={handleOpenMenu}
            sx={{
              flexShrink: 0,
              color: isActive ? 'common.white' : 'text.secondary',
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => handleCloseMenu()}
            onClick={event => event.stopPropagation()}
          >
            {canRequestDeadlineExtension && (
              <MenuItem
                onClick={event => {
                  handleCloseMenu(event);
                  onRequestDeadlineExtension?.(task);
                }}
              >
                Запросить перенос дедлайна
              </MenuItem>
            )}
            {canRequestAnnulment && (
              <>
                <Divider />
                <MenuItem
                  onClick={event => {
                    handleCloseMenu(event);
                    onRequestAnnulment?.(task);
                  }}
                >
                  Запросить аннулирование
                </MenuItem>
              </>
            )}
          </Menu>
        </>
      )}
    </Stack>
  );
};

export const TaskListDialog = ({
  open,
  onClose,
  postId,
  tasks = [],
  currentTaskId,
  currentTask,
  title = 'Список задач',
  isLoading = false,
  onSelectTask,
  showExecutor = false,
  currentUserId,
  onRequestAnnulment,
  onRequestDeadlineExtension,
  variant = 'dialog',
}: TaskListDialogProps) => {
  const isPostMode = Boolean(postId);
  const isDrawer = variant === 'drawer';
  const [tab, setTab] = useState<TaskListTab>('active');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const skipTabQueries = !open || !isPostMode;

  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm'));
  const isDrawerMobile = useMediaQuery(theme => theme.breakpoints.down('md'));

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setIsSearchOpen(false);
        setQuery('');
      }, 0);
      return;
    }

    setTimeout(() => {
      setTab(resolveTabForTask(currentTask));
    }, 0);
  }, [open, currentTask]);

  const activeQuery = usePostTasksQuery(
    postId ?? null,
    TAB_QUERY_PARAMS.active,
    skipTabQueries,
  );
  const archivedQuery = usePostTasksQuery(
    postId ?? null,
    TAB_QUERY_PARAMS.archived,
    skipTabQueries,
  );
  const completedQuery = usePostTasksQuery(
    postId ?? null,
    TAB_QUERY_PARAMS.completed,
    skipTabQueries,
  );
  const cancelledQuery = usePostTasksQuery(
    postId ?? null,
    TAB_QUERY_PARAMS.cancelled,
    skipTabQueries,
  );

  const tabQueries = {
    active: activeQuery,
    archived: archivedQuery,
    completed: completedQuery,
    cancelled: cancelledQuery,
  };

  const currentQuery = tabQueries[tab];

  const listItems = useMemo(() => {
    const items = isPostMode ? (currentQuery.data?.items ?? []) : tasks;

    return items.filter(task => matchesTaskQuery(task, query));
  }, [currentQuery.data?.items, isPostMode, query, tasks]);

  const tabCounts = {
    active: activeQuery.data?.total,
    archived: archivedQuery.data?.total,
    completed: completedQuery.data?.total,
    cancelled: cancelledQuery.data?.total,
  };

  const handleSelect = onSelectTask
    ? (task: Task) => {
      onSelectTask(task);
      onClose();
    }
    : undefined;

  const showLoader =
    (isPostMode &&
      (currentQuery.isLoading || currentQuery.isFetching) &&
      !listItems.length) ||
    (!isPostMode && isLoading && !listItems.length);

  const content = (
    <>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', mb: 2, flexShrink: 0 }}
      >
        {isSearchOpen ? (
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={query}
            placeholder="Поиск по задачам"
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key !== 'Escape') return;

              setQuery('');
              setIsSearchOpen(false);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: query ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Очистить поиск"
                      onClick={() => setQuery('')}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
            sx={{
              minWidth: 0,
              '& .MuiOutlinedInput-root': { borderRadius: '12px' },
            }}
          />
        ) : (
          <Typography variant="h6" sx={{ flex: 1, minWidth: 0 }} noWrap>
            {title}
          </Typography>
        )}

        <IconButton
          aria-label={isSearchOpen ? 'Закрыть поиск' : 'Поиск'}
          color={isSearchOpen ? 'primary' : 'default'}
          onClick={() => {
            setIsSearchOpen(prev => {
              if (prev) setQuery('');
              return !prev;
            });
          }}
        >
          <Search />
        </IconButton>
        <IconButton
          aria-label="Закрыть"
          onClick={onClose}
        >
          <Close />
        </IconButton>
      </Stack>

      {isPostMode && (
        <Tabs
          value={tab}
          onChange={(_, value: TaskListTab) => setTab(value)}
          aria-label="Фильтр задач поста"
          variant={isMobile ? 'scrollable' : 'standard'}
          sx={{ mb: 2, minHeight: 40, flexShrink: 0 }}
        >
          {TAB_ITEMS.map(item => (
            <Tab
              key={item.value}
              value={item.value}
              label={
                <Stack
                  direction="row"
                  sx={{ alignItems: 'center' }}
                >
                  {item.label}
                  <TabCountBadge
                    count={tabCounts[item.value]}
                    isActive={tab === item.value}
                  />
                </Stack>
              }
              sx={{ minHeight: 40, textTransform: 'none' }}
            />
          ))}
        </Tabs>
      )}

      <Box
        sx={{
          ...(isDrawer
            ? {
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
              }
            : {
                height: 420,
                minHeight: 420,
                maxHeight: 420,
                overflowY: 'auto',
              }),
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '16px',
          p: 1,
          scrollbarWidth: 'none',
        }}
      >
        {showLoader ? (
          <Stack
            sx={{
              height: '100%',
              minHeight: isDrawer ? 200 : undefined,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={28} />
          </Stack>
        ) : !listItems.length ? (
          <EmptyBlock
            title={query.trim() ? 'Ничего не найдено' : 'Список задач пуст'}
            icon={<FolderOutlined color="info" fontSize="large" />}
          />
        ) : (
          <Stack
            spacing={1}
            direction="column"
          >
            {listItems.map(task => (
              <TaskListItem
                key={task.id}
                task={task}
                isActive={currentTaskId === task.id}
                onSelect={handleSelect}
                showExecutor={showExecutor || isPostMode}
                currentUserId={currentUserId}
                onRequestAnnulment={onRequestAnnulment}
                onRequestDeadlineExtension={onRequestDeadlineExtension}
              />
            ))}
          </Stack>
        )}
      </Box>
    </>
  );

  if (isDrawer) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 2, md: 4 },
            width: isDrawerMobile ? '100%' : 420,
            borderTopLeftRadius: { xs: 0, md: 32 },
            borderBottomLeftRadius: { xs: 0, md: 32 },
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: { xs: 2, sm: 3 },
            width: '100%',
            m: 2,
          },
        },
      }}
    >
      {content}
    </Dialog>
  );
};
