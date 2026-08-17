import { Close, FolderOutlined, } from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import {
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  executorToUserPartial,
  getTaskStatusColor,
  getUserName,
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
  title?: string;
  onSelectTask: (task: Task) => void;
  /** Показывать исполнителя у пунктов списка */
  showExecutor?: boolean;
};

const getExecutorLabel = (task: Task) =>
  getUserName(executorToUserPartial(task.executor)) || 'Не назначен';

const TaskListItem = ({
  task,
  isActive,
  onSelect,
  showExecutor = false,
}: {
  task: Task;
  isActive: boolean;
  onSelect: (task: Task) => void;
  showExecutor?: boolean;
}) => (
  <Stack
    direction="row"
    spacing={1.5}
    onClick={() => onSelect(task)}
    sx={{
      p: 1.5,
      cursor: 'pointer',
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
  </Stack>
);

export const TaskListDialog = ({
  open,
  onClose,
  postId,
  tasks = [],
  currentTaskId,
  currentTask,
  title = 'Список задач',
  onSelectTask,
  showExecutor = false,
}: TaskListDialogProps) => {
  const isPostMode = Boolean(postId);
  const [tab, setTab] = useState<TaskListTab>('active');

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      setTab(resolveTabForTask(currentTask));
    }, 0);
  }, [open, currentTask]);

  const queryParams = TAB_QUERY_PARAMS[tab];

  const { data, isLoading, isFetching } = usePostTasksQuery(
    postId ?? null,
    queryParams,
    !open || !isPostMode,
  );

  const listItems = useMemo(() => {
    if (isPostMode) {
      return data?.items ?? [];
    }

    return tasks;
  }, [data?.items, isPostMode, tasks]);

  const handleSelect = (task: Task) => {
    onSelectTask(task);
    onClose();
  };

  const showLoader = isPostMode && (isLoading || isFetching) && !listItems.length;

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
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">{title}</Typography>
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
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, minHeight: 40 }}
        >
          {TAB_ITEMS.map(item => (
            <Tab
              key={item.value}
              value={item.value}
              label={item.label}
              sx={{ minHeight: 40, textTransform: 'none' }}
            />
          ))}
        </Tabs>
      )}

      <Box
        sx={{
          height: 420,
          minHeight: 420,
          maxHeight: 420,
          overflowY: 'auto',
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
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={28} />
          </Stack>
        ) : !listItems.length ? (
          <EmptyBlock
            title="Список задач пуст"
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
              />
            ))}
          </Stack>
        )}
      </Box>
    </Dialog>
  );
};
