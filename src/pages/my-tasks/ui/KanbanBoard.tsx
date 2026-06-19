import { Box, Stack } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  canEditTaskStatus,
  taskKeys,
  useUpdateTaskMutation,
  type Task,
  type TaskList,
  type TaskListParams,
  type TaskStatus,
} from '@/entities/task';
import { useAuthStore } from '@/features/auth';

import { KANBAN_COLUMNS } from '../model/kanbanColumns';

import { KanbanColumn } from './KanbanColumn';

type KanbanBoardProps = {
  tasks: Task[];
  visibleColumns: TaskStatus[];
  queryParams: TaskListParams;
  onHideColumn: (status: TaskStatus) => void;
};

export const KanbanBoard = ({
  tasks,
  visibleColumns,
  queryParams,
  onHideColumn,
}: KanbanBoardProps) => {
  const currentUserId = useAuthStore(state => state.id);
  const queryClient = useQueryClient();
  const { mutate: updateTask } = useUpdateTaskMutation();

  const columns = KANBAN_COLUMNS.filter(column =>
    visibleColumns.includes(column.status)
  );

  const canDragTask = (task: Task) =>
    canEditTaskStatus(task, currentUserId ?? null);

  const handleTaskDrop = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(item => item.id === taskId);

    if (!task || task.status === newStatus) return;
    if (!canEditTaskStatus(task, currentUserId ?? null)) return;

    const listQueryKey = taskKeys.list(queryParams);
    const previousData = queryClient.getQueryData<TaskList>(listQueryKey);

    queryClient.setQueryData<TaskList>(listQueryKey, old => {
      if (!old) return old;

      return {
        ...old,
        items: old.items.map(item =>
          item.id === taskId ? { ...item, status: newStatus } : item
        ),
      };
    });

    updateTask(
      { id: taskId, body: { status: newStatus } },
      {
        onError: () => {
          queryClient.setQueryData(listQueryKey, previousData);
        },
      }
    );
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        bgcolor: 'white',
        borderRadius: { xs: '16px', md: '32px' },
        p: { xs: 1.5, md: 2 },
      }}
    >
      <DndProvider backend={HTML5Backend}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            pb: 1,
            flex: 1,
            minHeight: 0,
            height: '100%',
            width: '100%',
            overflowX: 'auto',
            alignItems: 'stretch',
          }}
        >
          {columns.map(column => (
            <KanbanColumn
              key={column.status}
              column={column}
              onHideColumn={onHideColumn}
              onTaskDrop={handleTaskDrop}
              canDragTask={canDragTask}
              tasks={tasks.filter(task => task.status === column.status)}
            />
          ))}
        </Stack>
      </DndProvider>
    </Box>
  );
};

export default KanbanBoard;
