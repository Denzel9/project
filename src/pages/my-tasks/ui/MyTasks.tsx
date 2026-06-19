import { Box, CircularProgress, Grid } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useTasksQuery } from '@/entities';
import { ROUTES, EmptyBlock } from '@/shared';
import { PageLayout } from '@/widgets';

import { useMyTaskFilterStore } from '../model/store';
import { toTasksParams } from '../model/utils';

import { MyTaskFilter } from './Filter';
import { KanbanBoard } from './KanbanBoard';
import { TaskItem } from './TaskItem';
import { TaskTable } from './TaskTable';

export const MyTasks = () => {
  const navigate = useNavigate();

  const {
    status,
    viewMode,
    updatedDate,
    isChangedFilters,
    toggleKanbanColumn,
    visibleKanbanColumns,
  } = useMyTaskFilterStore();

  const queryParams = useMemo(
    () =>
      toTasksParams({
        updatedDate,
        status: viewMode === 'kanban' ? 'all' : status,
      }),
    [status, viewMode, updatedDate]
  );

  const { data: tasks, isLoading } = useTasksQuery(queryParams);

  const isKanban = viewMode === 'kanban';
  const isEmpty = !isLoading && !tasks?.items?.length;

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
        {Boolean(tasks?.items?.length || !isChangedFilters) && (
          <Box
            sx={{
              top: 0,
              zIndex: 1000,
              flexShrink: 0,
              position: 'sticky',
            }}
          >
            <MyTaskFilter />
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
                {tasks?.items?.map(task => (
                  <Grid
                    key={task.id}
                    size={{ xs: 12, sm: 6, md: 4 }}
                  >
                    <TaskItem task={task} />
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
                  tasks={tasks?.items ?? []}
                  queryParams={queryParams}
                  visibleColumns={visibleKanbanColumns}
                  onHideColumn={toggleKanbanColumn}
                />
              </Box>
            )}

            {viewMode === 'table' && <TaskTable tasks={tasks?.items ?? []} />}
          </Box>
        )}
      </Box>
    </PageLayout>
  );
};

export default MyTasks;
