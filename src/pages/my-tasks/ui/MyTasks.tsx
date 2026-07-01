import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import { USER_ROLE, useAllTasksQuery } from '@/entities';
import { useAuthStore } from '@/features';
import {
  useMyTaskFilterStore,
  getVisibleTasks,
  toTaskFilterParams,
  MyTaskFilter,
} from '@/features';
import { EmptyBlock } from '@/shared';
import { ConfirmDialog, PageLayout } from '@/widgets';

import { useTasksLoadMore } from '../model/useTasksLoadMore';
import { useTasksPagination } from '../model/useTasksPagination';

import { KanbanBoard } from './KanbanBoard';
import { TaskItem } from './TaskItem';
import { TasksLoadMoreButton } from './TasksLoadMoreButton';
import { TaskTable } from './TaskTable';

type InitialPost = {
  id?: string;
  title?: string;
};

export const MyTasks = () => {
  const [initialPosts, setInitialPosts] = useState<InitialPost[]>([]);
  const [isOpenPrimeRecommendation, setIsOpenPrimeRecommendation] =
    useState(false);

  const { role } = useAuthStore();

  const {
    status,
    postId,
    viewMode,
    updatedDate,
    toggleKanbanColumn,
    visibleKanbanColumns,
    fastButtonValue,
    extraFilter,
  } = useMyTaskFilterStore();

  const filterParams = useMemo(
    () =>
      toTaskFilterParams({
        updatedDate,
        status: viewMode === 'kanban' ? 'all' : status,
        postId: postId === 'all' ? undefined : postId,
      }),
    [updatedDate, viewMode, status, postId]
  );

  const { data: tasks = [], isLoading } = useAllTasksQuery(filterParams);

  const filteredTasks = useMemo(
    () =>
      getVisibleTasks(tasks, {
        viewMode,
        status,
        fastButtonValue,
        extraFilter,
        isCompany: role === USER_ROLE.COMPANY,
      }),
    [tasks, viewMode, status, fastButtonValue, extraFilter, role]
  );

  const contentRef = useRef<HTMLDivElement>(null);

  const paginationResetKey = useMemo(
    () =>
      [
        viewMode,
        status,
        postId,
        fastButtonValue,
        extraFilter ?? '',
        updatedDate ?? '',
      ].join('|'),
    [viewMode, status, postId, fastButtonValue, extraFilter, updatedDate]
  );

  const { page, onPageChange } = useTasksPagination(
    filteredTasks,
    paginationResetKey,
    {
      scrollTargetRef: contentRef,
    }
  );

  const { visibleItems, hasMore, hiddenCount, loadMore } = useTasksLoadMore(
    filteredTasks,
    paginationResetKey
  );

  const hasMultipleTasksForOnePost = tasks.some(
    task => task.postId === tasks[0]?.postId
  );

  useEffect(() => {
    if (localStorage.getItem('prime-recommendation-closed')) return;

    if (hasMultipleTasksForOnePost) {
      setTimeout(() => {
        setIsOpenPrimeRecommendation(true);
      }, 0);
    }
  }, [hasMultipleTasksForOnePost]);

  useEffect(() => {
    if (tasks.length && !initialPosts?.length) {
      const preparedTasks = tasks.map(task => ({
        id: task?.post?.id,
        title: task.post?.title,
      }));

      const uniqueTasks = preparedTasks.filter(
        (task, index, self) => index === self.findIndex(t => t.id === task.id)
      );

      setTimeout(() => {
        setInitialPosts(uniqueTasks);
      }, 0);
    }
  }, [initialPosts?.length, tasks]);

  const handleClosePrimeRecommendation = () => {
    setIsOpenPrimeRecommendation(false);
    localStorage.setItem('prime-recommendation-closed', 'true');
  };

  const isKanban = viewMode === 'kanban';
  const isTable = viewMode === 'table';
  const isFullHeightView = isKanban || isTable;
  const isEmpty = !isLoading && !filteredTasks.length;

  return (
    <PageLayout
      withFooter={false}
      isScreenHeight={isFullHeightView}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: 1,
          ...(isFullHeightView && {
            flex: 1,
            minHeight: 0,
            height: '100%',
          }),
        }}
      >
        <Box
          sx={{
            top: 0,
            zIndex: 1000,
            flexShrink: 0,
            position: 'sticky',
          }}
        >
          <MyTaskFilter
            tasks={tasks}
            initialPosts={initialPosts}
            isCompany={role === USER_ROLE.COMPANY}
          />
        </Box>

        {isEmpty && (
          <Box
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              bgcolor: 'white',
              border: '1px solid',
              borderRadius: '32px',
              borderColor: 'divider',
              justifyContent: 'center',
            }}
          >
            <EmptyBlock
              buttonText="На главную"
              title="У вас пока нет задач"
            />
          </Box>
        )}

        {!isEmpty && !isLoading && (
          <Box
            sx={{
              gap: 1,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '32px',
              ...(isFullHeightView && {
                flex: 1,
                minHeight: 0,
              }),
            }}
          >
            <Box
              ref={contentRef}
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                ...(isFullHeightView
                  ? {
                      flex: 1,
                      minHeight: 0,
                    }
                  : {}),
              }}
            >
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              )}

              {viewMode === 'grid' && (
                <Grid
                  container
                  spacing={1}
                  sx={{ width: '100%' }}
                >
                  {visibleItems.map(task => (
                    <Grid
                      key={task.id}
                      size={{ xs: 12, sm: 6, md: 4 }}
                    >
                      <TaskItem
                        task={task}
                        isCompany={role === USER_ROLE.COMPANY}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}

              {viewMode === 'kanban' && (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                  }}
                >
                  <KanbanBoard
                    tasks={visibleItems}
                    filterParams={filterParams}
                    onHideColumn={toggleKanbanColumn}
                    visibleColumns={visibleKanbanColumns}
                  />
                </Box>
              )}

              {viewMode === 'table' && (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    width: '100%',
                  }}
                >
                  <TaskTable
                    tasks={filteredTasks}
                    page={page}
                    onPageChange={onPageChange}
                  />
                </Box>
              )}
            </Box>

            {hasMore && viewMode !== 'table' && (
              <TasksLoadMoreButton
                hiddenCount={hiddenCount}
                onClick={loadMore}
              />
            )}
          </Box>
        )}

        {/* TODO PRIME */}
        <ConfirmDialog
          withButtons={false}
          isOpen={isOpenPrimeRecommendation}
          onClose={() => setIsOpenPrimeRecommendation(false)}
        >
          <Typography variant="h6">
            Найдено несколько задач по одному объявлению
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 2 }}
          >
            Prime-аккаунт позволяет объединить задачи по одному объявлению в
            одну.
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 4 }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={handleClosePrimeRecommendation}
            >
              Отказаться
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsOpenPrimeRecommendation(false)}
            >
              Подключить
            </Button>
          </Stack>
        </ConfirmDialog>
      </Box>
    </PageLayout>
  );
};

export default MyTasks;
