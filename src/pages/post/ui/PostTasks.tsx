import { Box, CircularProgress, Grid } from '@mui/material';
import { useNavigate } from 'react-router';

import {
  useCreateTaskMutation,
  useInstantiateTaskTemplateMutation,
  useUpdateTaskMutation,
  type TaskList,
} from '@/entities';
import { useRequireEmailConfirmed } from '@/features';
import { useExecutorPickerOptions } from '@/features/task-filter/model/useExecutorPickerOptions';
import { TaskItem } from '@/pages/my-tasks/ui/TaskItem';
import { CreateTaskDialog } from '@/pages/task/ui/CreateTaskDialog';
import { EmptyBlock, ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

type PostTasksProps = {
  postId: string;
  tasks?: TaskList;
  isLoading: boolean;
  isCreateOpen: boolean;
  onCreateOpenChange: (open: boolean) => void;
};

export const PostTasks = ({
  postId,
  tasks,
  isLoading,
  isCreateOpen,
  onCreateOpenChange,
}: PostTasksProps) => {
  const navigate = useNavigate();

  const { setSnackbarOpen } = useSnackbarStore();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();
  const { options: executorOptions } = useExecutorPickerOptions(isCreateOpen);

  const { mutateAsync: createTask, isPending: isCreating } =
    useCreateTaskMutation();
  const { mutateAsync: instantiateTemplate, isPending: isInstantiating } =
    useInstantiateTaskTemplateMutation();
  const { mutateAsync: updateTask, isPending: isUpdating } =
    useUpdateTaskMutation();

  const isCreatePending = isCreating || isInstantiating || isUpdating;
  const items = tasks?.items ?? [];

  const handleOpenCreate = () => {
    if (!requireEmailConfirmed()) return;
    onCreateOpenChange(true);
  };

  const handleCreateTask = async ({
    title,
    executorId,
    templateId,
  }: {
    title: string;
    executorId: string | null;
    templateId: string | null;
  }) => {
    try {
      let taskId: string;

      if (templateId) {
        let task = await instantiateTemplate({
          id: templateId,
          body: {
            postId,
            ...(executorId && { executorId }),
          },
        });

        if (title && title !== (task.title ?? '')) {
          task = await updateTask({
            id: task.id,
            body: { title },
          });
        }

        taskId = task.id;
      } else {
        const task = await createTask({
          postId,
          ...(title && { title }),
          ...(executorId && { executorId }),
        });
        taskId = task.id;
      }

      setSnackbarOpen(true, 'Задача успешно создана');
      onCreateOpenChange(false);
      navigate(`${ROUTES.TASK}/${postId}?taskId=${taskId}`);
    } catch {
      setSnackbarOpen(true, 'Не удалось создать задачу');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!items.length) {
    return (
      <>
        <Box
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            bgcolor: 'background.paper',
            alignItems: 'center',
            borderRadius: '32px',
            justifyContent: 'center',
          }}
        >
          <EmptyBlock
            title="Пока нет задач по этому объявлению"
            buttonText="Создать задачу"
            buttonOnClick={handleOpenCreate}
          />
        </Box>

        <CreateTaskDialog
          open={isCreateOpen}
          isPending={isCreatePending}
          executorOptions={executorOptions}
          onClose={() => onCreateOpenChange(false)}
          onConfirm={handleCreateTask}
        />
      </>
    );
  }

  return (
    <>
      <Grid
        container
        spacing={1}
      >
        {items.map(task => (
          <Grid
            key={task.id}
            size={{ xs: 12, sm: 6, md: 4 }}
            sx={{ display: 'flex' }}
          >
            <Box sx={{ width: '100%', height: '100%' }}>
              <TaskItem
                task={task}
                isCompany
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      <CreateTaskDialog
        open={isCreateOpen}
        isPending={isCreatePending}
        executorOptions={executorOptions}
        onClose={() => onCreateOpenChange(false)}
        onConfirm={handleCreateTask}
      />
    </>
  );
};
