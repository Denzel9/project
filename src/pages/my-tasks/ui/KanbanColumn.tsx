import { MoreVert } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useRef, useState, memo } from 'react';
import { useDrop } from 'react-dnd';

import { canTransitionTaskStatus, type Task, type TaskStatus } from '@/entities';
import { useAuthStore } from '@/features';
import { InfiniteScrollSentinel } from '@/shared';

import { KANBAN_COLUMN_PAGE_SIZE } from '../model/constants/constants';
import { useTasksLoadMore } from '../model/utils/useTasksLoadMore';

import {
  KanbanTaskCard,
  KANBAN_TASK_DRAG_TYPE,
  type KanbanTaskDragItem,
} from './KanbanTaskCard';

import type { KanbanColumnConfig } from '@/features';

type KanbanColumnProps = {
  tasks: Task[];
  column: KanbanColumnConfig;
  resetKey: string;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  canDragTask: (task: Task) => boolean;
  onFetchNextPage?: () => void;
  onHideColumn: (status: TaskStatus) => void;
  onTaskDrop: (taskId: string, status: TaskStatus) => void;
};

export const KanbanColumn = memo(function KanbanColumn({
  tasks,
  column,
  resetKey,
  onTaskDrop,
  canDragTask,
  onHideColumn,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage,
}: KanbanColumnProps) {
  const { visibleItems, hasMore, loadMore } = useTasksLoadMore(
    tasks,
    `${resetKey}|${column.status}`,
    { step: KANBAN_COLUMN_PAGE_SIZE },
  );
  const ref = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currentUserId = useAuthStore(state => state.id);

  const canDropItem = (item: KanbanTaskDragItem | null) => {
    if (!item) return false;

    return canTransitionTaskStatus(
      {
        status: item.status,
        ownerId: item.ownerId,
        executorId: item.executorId,
        isExecutorApprove: item.isExecutorApprove,
        isCompanyAction: item.isCompanyAction,
      },
      currentUserId ?? null,
      column.status,
    );
  };

  const [{ isOver, isOverForbidden, isSourceColumn }, drop] = useDrop({
    accept: KANBAN_TASK_DRAG_TYPE,
    canDrop: (item: KanbanTaskDragItem) => item.status !== column.status,
    drop: (item: KanbanTaskDragItem) => {
      onTaskDrop(item.taskId, column.status);
    },
    collect: monitor => {
      const item = monitor.getItem<KanbanTaskDragItem | null>();
      const isDraggingType =
        monitor.getItemType() === KANBAN_TASK_DRAG_TYPE && Boolean(item);
      const over = monitor.isOver({ shallow: true });
      const allowed = canDropItem(item);
      const isSourceColumn =
        isDraggingType && item?.status === column.status;

      return {
        isOver: over && allowed,
        isOverForbidden: over && Boolean(item) && !allowed && !isSourceColumn,
        isSourceColumn,
      };
    },
  });

  // eslint-disable-next-line react-hooks/refs
  drop(ref);

  const handleLoadMore = () => {
    if (hasMore) {
      loadMore();
      return;
    }

    if (hasNextPage) {
      onFetchNextPage?.();
    }
  };

  const sentinelHasMore = hasMore || hasNextPage;

  return (
    <Box
      ref={ref}
      sx={{
        p: 1.5,
        width: 320,
        minHeight: 0,
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        overflow: 'hidden',
        borderRadius: '20px',
        flexDirection: 'column',
        bgcolor: isOver
          ? 'info.light'
          : isSourceColumn
            ? 'grey.300'
            : isOverForbidden
              ? 'error.light'
              : 'secondary.light',
        border: theme =>
          `1px solid ${
            isOver
              ? theme.palette.primary.main
              : isSourceColumn
                ? theme.palette.grey[400]
                : isOverForbidden
                  ? theme.palette.error.main
                  : theme.palette.secondary.main
          }`,
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          px: 0.5,
          flexShrink: 0,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            flexShrink: 0,
            borderRadius: '4px',
            bgcolor: `${column.color}.main`,
          }}
        />
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, minWidth: 0 }}
        >
          {column.label}
        </Typography>
        <Chip
          size="small"
          label={tasks.length}
          sx={{ height: 22, fontSize: '0.75rem' }}
        />
        <Box sx={{ flex: 1 }} />
        <IconButton
          size="small"
          onClick={event => setAnchorEl(event.currentTarget)}
        >
          <MoreVert fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              onHideColumn(column.status);
              setAnchorEl(null);
            }}
          >
            Скрыть колонку
          </MenuItem>
        </Menu>
      </Stack>

      <Stack
        spacing={1.5}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {tasks.length === 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              py: 4,
              textAlign: 'center',
              alignSelf: 'center',
            }}
          >
            Перетащите задачу сюда
          </Typography>
        )}

        {visibleItems.map(task => (
          <KanbanTaskCard
            task={task}
            key={task.id}
            canDrag={canDragTask(task)}
          />
        ))}

        <InfiniteScrollSentinel
          hasMore={sentinelHasMore}
          isLoading={isFetchingNextPage}
          onLoadMore={handleLoadMore}
        />
      </Stack>
    </Box>
  );
});

export default KanbanColumn;
