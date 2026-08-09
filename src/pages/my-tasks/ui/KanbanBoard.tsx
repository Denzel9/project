import { Box, Stack } from '@mui/material';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import {
  canTransitionTaskStatus,
  getAllowedTaskStatusTransitions,
  getIsCompanyAction,
  getTaskStatusTransitionBlockReason,
  isTaskOwner,
  taskKeys,
  useUpdateTaskMutation,
  type Task,
  type TaskList,
  type TaskListParams,
  type TaskStatus,
} from '@/entities';
import { useAuthStore, KANBAN_COLUMNS, getTaskConfig } from '@/features';
import { useSnackbarStore } from '@/widgets';

import { KanbanColumn } from './KanbanColumn';

const EMPTY_COLUMN_TASKS: Task[] = [];

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

    const columns = useMemo(
      () =>
        KANBAN_COLUMNS.filter(column =>
          visibleColumns.includes(column.status),
        ),
      [visibleColumns],
    );

    const tasksByStatus = useMemo(() => {
      const map = new Map<TaskStatus, Task[]>();

      for (const task of tasks) {
        const bucket = map.get(task.status);

        if (bucket) {
          bucket.push(task);
        } else {
          map.set(task.status, [task]);
        }
      }

      return map;
    }, [tasks]);

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

    const canDragTask = useCallback(
      (task: Task) =>
        getAllowedTaskStatusTransitions(task, currentUserId ?? null).length >
        0,
      [currentUserId],
    );

    const handleTaskDrop = useCallback(
      (taskId: string, newStatus: TaskStatus) => {
        const task = tasks.find(item => item.id === taskId);

        if (!task || task.status === newStatus) return;

        if (!canTransitionTaskStatus(task, currentUserId ?? null, newStatus)) {
          const reason = getTaskStatusTransitionBlockReason(
            task,
            currentUserId ?? null,
            newStatus,
          );
          const columnLabel = getTaskConfig(newStatus)?.label ?? newStatus;

          setSnackbarOpen?.(
            true,
            reason ?? `Нельзя перевести в «${columnLabel}»`,
            'warning',
          );
          return;
        }

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
      },
      [
        tasks,
        updateTask,
        queryClient,
        filterParams,
        currentUserId,
        setSnackbarOpen,
      ],
    );

    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          display: 'flex',
          bgcolor: 'white',
          p: { xs: 1.5, md: 2 },
          borderRadius: { xs: '16px', md: '24px' },
        }}
      >
        <DndProvider backend={HTML5Backend}>
          <Stack
            spacing={1}
            direction="row"
            ref={scrollContainerRef}
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
                sx={{ flexShrink: 0 }}
                data-kanban-column={column.status}
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
                  tasks={tasksByStatus.get(column.status) ?? EMPTY_COLUMN_TASKS}
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
