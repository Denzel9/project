import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { USER_ROLE, useTasksQuery } from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES, EmptyBlock } from '@/shared';
import { ConfirmDialog, PageLayout } from '@/widgets';

import { useMyTaskFilterStore } from '../model/store';
import { filterTasksByExecutorApprove, toTasksParams } from '../model/utils';

import { MyTaskFilter } from './Filter';
import { KanbanBoard } from './KanbanBoard';
import { TaskItem } from './TaskItem';
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

  const navigate = useNavigate();

  const {
    status,
    postId,
    viewMode,
    updatedDate,
    isChangedFilters,
    toggleKanbanColumn,
    visibleKanbanColumns,
    executorApproveFilter,
  } = useMyTaskFilterStore();

  const queryParams = useMemo(
    () =>
      toTasksParams({
        updatedDate,
        status: viewMode === 'kanban' ? 'all' : status,
        postId: postId === 'all' ? undefined : postId,
      }),
    [updatedDate, viewMode, status, postId]
  );

  const { data: tasks, isLoading } = useTasksQuery(queryParams);

  const filteredTasks = useMemo(
    () =>
      filterTasksByExecutorApprove(tasks?.items ?? [], executorApproveFilter),
    [tasks?.items, executorApproveFilter]
  );

  const hasMultipleTasksForOnePost = tasks?.items?.some(
    task => task.postId === tasks?.items?.[0]?.postId
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
    if (tasks?.items?.length && !initialPosts?.length) {
      const preparedTasks = tasks?.items?.map(task => ({
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
  }, [initialPosts?.length, tasks?.items]);

  const handleClosePrimeRecommendation = () => {
    setIsOpenPrimeRecommendation(false);
    localStorage.setItem('prime-recommendation-closed', 'true');
  };

  const isKanban = viewMode === 'kanban';
  const isEmpty = !isLoading && !filteredTasks.length;
  const hasTasks = Boolean(tasks?.items?.length);

  return (
    <PageLayout
      title="Мои задачи"
      isScreenHeight={isKanban}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flex: 1,
          ...(isKanban && {
            flex: 1,
            minHeight: 0,
            height: '100%',
          }),
        }}
      >
        {Boolean(hasTasks || !isChangedFilters()) && (
          <Box
            sx={{
              top: 0,
              zIndex: 1000,
              flexShrink: 0,
              position: 'sticky',
            }}
          >
            <MyTaskFilter
              tasks={tasks?.items ?? []}
              initialPosts={initialPosts}
              isCompany={role === USER_ROLE.COMPANY}
            />
          </Box>
        )}

        {isEmpty && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              bgcolor: 'white',
              borderRadius: '32px',
              height: '100%',
              flex: 1,
            }}
          >
            <EmptyBlock
              buttonText="На главную"
              title={
                isChangedFilters()
                  ? 'Попробуйте изменить фильтры'
                  : 'У вас пока нет задач'
              }
              buttonOnClick={() => navigate(ROUTES.INDEX)}
            />
          </Box>
        )}

        {!isEmpty && !isLoading && (
          <Box
            sx={{
              gap: 2,
              width: '100%',
              display: 'flex',
              borderRadius: '32px',
              ...(isKanban
                ? {
                    flex: 1,
                    minHeight: 0,
                    flexDirection: 'column',
                  }
                : {
                    flex: 1,
                    alignItems: isEmpty ? 'center' : 'start',
                    justifyContent: isEmpty ? 'center' : 'start',
                  }),
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
                spacing={2}
                sx={{ width: '100%' }}
              >
                {filteredTasks.map(task => (
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
                  tasks={filteredTasks}
                  queryParams={queryParams}
                  visibleColumns={visibleKanbanColumns}
                  onHideColumn={toggleKanbanColumn}
                />
              </Box>
            )}

            {viewMode === 'table' && <TaskTable tasks={filteredTasks} />}
          </Box>
        )}
      </Box>

      {/* PRIME */}
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
          Prime-аккаунт позволяет объединить задачи по одному объявлению в одну.
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
    </PageLayout>
  );
};

export default MyTasks;
