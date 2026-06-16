import { Box, CircularProgress, Grid } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useTasksQuery } from '@/entities/task';
import { EmptyBlock } from '@/shared';
import { ROUTES } from '@/shared/config/routes';
import { PageLayout } from '@/widgets';

import {
  toTasksParams,
  type TaskRoleFilter,
  type TaskStatusFilter,
} from '../model/utils';

import { MyTaskFilter } from './Filter';
import { TaskItem } from './TaskItem';

export const MyTask = () => {
  const [role, setRole] = useState<TaskRoleFilter>('all');
  const [status, setStatus] = useState<TaskStatusFilter>('all');

  const { data: tasks, isLoading } = useTasksQuery(toTasksParams({ role, status }));

  const navigate = useNavigate();

  const isEmpty = !isLoading && !tasks?.items?.length;

  return (
    <PageLayout title="Мои задачи">
      <MyTaskFilter
        role={role}
        status={status}
        onRoleChange={setRole}
        onStatusChange={setStatus}
      />

      <Box
        sx={{
          gap: 2,
          width: '100%',
          display: 'flex',
          bgcolor: 'white',
          p: { xs: 3, md: 4 },
          borderRadius: '32px',
          alignItems: isEmpty ? 'center' : 'start',
          justifyContent: isEmpty ? 'center' : 'start',
        }}
      >
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {isEmpty && (
          <EmptyBlock
            title="У вас пока нет задач"
            buttonText="На главную"
            buttonOnClick={() => navigate(ROUTES.INDEX)}
          />
        )}

        {!isEmpty && (
          <Grid
            container
            spacing={2}
            sx={{ width: '100%' }}
          >
            {tasks?.items?.map(task => (
              <Grid
                key={task.id}
                size={{ xs: 12, md: 4 }}
              >
                <TaskItem task={task} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </PageLayout>
  );
};

export default MyTask;
