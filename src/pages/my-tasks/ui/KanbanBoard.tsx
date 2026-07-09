import { Box, Stack } from '@mui/material';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  canEditTaskStatus,
  getIsCompanyAction,
  isTaskOwner,
  taskKeys,
  useUpdateTaskMutation,
  type Task,
  type TaskList,
  type TaskListParams,
  type TaskStatus,
} from '@/entities';
import { useAuthStore, KANBAN_COLUMNS } from '@/features';
import { useSnackbarStore } from '@/widgets';

import { KanbanColumn } from './KanbanColumn';

type KanbanBoardProps = {
  tasks: Task[];
  resetKey: string;
  visibleColumns: TaskStatus[];
  filterParams: Omit<TaskListParams, 'page'>;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
  onHideColumn: (status: TaskStatus) => void;
};

export type KanbanBoardHandle = {
  scrollToColumn: (status: TaskStatus) => void;
};

export const KanbanBoard = forwardRef<KanbanBoardHandle, KanbanBoardProps>(
  function KanbanBoard(
    {
      tasks,
      resetKey,
      visibleColumns,
      filterParams,
      hasNextPage = false,
      isFetchingNextPage = false,
      onFetchNextPage,
      onHideColumn,
    },
    ref,
  ) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { id: currentUserId } = useAuthStore();

  const queryClient = useQueryClient();

  const { setSnackbarOpen } = useSnackbarStore();

  const { mutate: updateTask } = useUpdateTaskMutation();

  const columns = KANBAN_COLUMNS.filter(column =>
    visibleColumns.includes(column.status),
  );

  useImperativeHandle(ref, () => ({
    scrollToColumn: (status: TaskStatus) => {
      const columnElement = scrollContainerRef.current?.querySelector(
        `[data-kanban-column="${status}"]`,
      );

      columnElement?.scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
    },
  }));

  const canDragTask = (task: Task) =>
    canEditTaskStatus(task, currentUserId ?? null);

  const handleTaskDrop = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(item => item.id === taskId);

    if (!task || task.status === newStatus) return;
    if (!canEditTaskStatus(task, currentUserId ?? null)) return;

    const isOwner = isTaskOwner(task, currentUserId ?? null);
    const isCompanyAction = getIsCompanyAction(task, isOwner, newStatus);

    const tasksQueryKey = taskKeys.infiniteList(filterParams);
    const previousData =
      queryClient.getQueryData<InfiniteData<TaskList>>(tasksQueryKey);

    queryClient.setQueryData<InfiniteData<TaskList>>(tasksQueryKey, old => {
      if (!old?.pages) return old;

      return {
        ...old,
        pages: old.pages.map(page => ({
          ...page,
          items: page.items.map(item =>
            item.id === taskId
              ? { ...item, status: newStatus, isCompanyAction }
              : item,
          ),
        })),
      };
    });

    updateTask(
      { id: taskId, body: { status: newStatus, isCompanyAction } },
      {
        onError: () => {
          queryClient.setQueryData(tasksQueryKey, previousData);
        },
        onSuccess: () => {
          setSnackbarOpen?.(true, 'Статус успешно изменен');
        },
      },
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
          ref={scrollContainerRef}
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
            <Box
              key={column.status}
              data-kanban-column={column.status}
              sx={{ flexShrink: 0 }}
            >
              <KanbanColumn
                column={column}
                resetKey={resetKey}
                hasNextPage={hasNextPage}
                onHideColumn={onHideColumn}
                onTaskDrop={handleTaskDrop}
                canDragTask={canDragTask}
                onFetchNextPage={onFetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                tasks={tasks.filter(task => task.status === column.status)}
              />
            </Box>
          ))}
        </Stack>
      </DndProvider>
    </Box>
  );
},
);

export default KanbanBoard;
