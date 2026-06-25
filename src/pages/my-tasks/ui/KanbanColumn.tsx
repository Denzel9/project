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
import { useRef, useState } from 'react';
import { useDrop } from 'react-dnd';

import { TASK_STATUS_ENUM, type Task, type TaskStatus } from '@/entities';

import {
  KanbanTaskCard,
  KANBAN_TASK_DRAG_TYPE,
  type KanbanTaskDragItem,
} from './KanbanTaskCard';

import type { KanbanColumnConfig } from '@/features';

type KanbanColumnProps = {
  tasks: Task[];
  column: KanbanColumnConfig;
  canDragTask: (task: Task) => boolean;
  onHideColumn: (status: TaskStatus) => void;
  onTaskDrop: (taskId: string, status: TaskStatus) => void;
};

export const KanbanColumn = ({
  tasks,
  column,
  onTaskDrop,
  canDragTask,
  onHideColumn,
}: KanbanColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getIsOver = (item: KanbanTaskDragItem) => {
    if (
      item?.status === TASK_STATUS_ENUM.PREPARING &&
      column?.status === TASK_STATUS_ENUM.PENDING_APPROVAL
    ) {
      return true;
    } else if (
      item?.status === TASK_STATUS_ENUM.PREPARING &&
      column?.status === TASK_STATUS_ENUM.CANCELLED
    ) {
      return true;
    } else if (
      item?.status === TASK_STATUS_ENUM.PENDING_APPROVAL &&
      column?.status === TASK_STATUS_ENUM.IN_PROGRESS
    ) {
      return true;
    } else if (
      (item?.status === TASK_STATUS_ENUM.IN_PROGRESS &&
        column?.status === TASK_STATUS_ENUM.REVISION) ||
      (item?.status === TASK_STATUS_ENUM.IN_PROGRESS &&
        column?.status === TASK_STATUS_ENUM.CHECKING)
    ) {
      return true;
    } else if (
      item?.status === TASK_STATUS_ENUM.REVISION &&
      column?.status === TASK_STATUS_ENUM.IN_PROGRESS
    ) {
      return true;
    } else if (
      (item?.status === TASK_STATUS_ENUM.CHECKING &&
        column?.status === TASK_STATUS_ENUM.REVISION) ||
      (item?.status === TASK_STATUS_ENUM.CHECKING &&
        column?.status === TASK_STATUS_ENUM.COMPLETED)
    ) {
      return true;
    }

    return false;
  };

  const [{ isOver }, drop] = useDrop({
    accept: KANBAN_TASK_DRAG_TYPE,
    drop: (item: KanbanTaskDragItem) => {
      if (getIsOver(item)) {
        onTaskDrop(item.taskId, column.status);
      }
    },
    collect: monitor => ({
      isOver: getIsOver(monitor?.getItem()),
    }),
  });

  // eslint-disable-next-line react-hooks/refs
  drop(ref);

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
        bgcolor: isOver ? 'info.light' : 'secondary.light',
        border: theme =>
          `1px solid ${isOver ? theme.palette.primary.main : theme.palette.secondary.main}`,
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

        {tasks.map(task => (
          <KanbanTaskCard
            task={task}
            key={task.id}
            canDrag={canDragTask(task)}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default KanbanColumn;
