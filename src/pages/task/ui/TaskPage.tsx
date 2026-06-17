import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import {
  canEditTaskFields,
  canEditTaskStatus,
  isTaskExecutor,
  isTaskOwner,
  useTaskByIdQuery,
  useUpdateTaskMutation,
  type TaskStatus,
  type UpdateTaskDto,
} from '@/entities/task';
import { TASK_STATUS_ENUM } from '@/entities/task/model/types';
import { useGetUserByIdQuery } from '@/entities/user';
import Gallery from '@/features/application-form/ui/Gallery';
import { useAuthStore } from '@/features/auth';
import {
  mapFormToUpdateTask,
  TaskForm,
  type TaskFormType,
} from '@/features/task-form';
import { PageLayout } from '@/widgets';

import { useTaskMediaSave } from '../model/hooks/useTaskMediaSave';

import { Activity } from './Activity';
import { ContactCard } from './ContactCard';
import { TaskComments } from './TaskComments';

export const TaskPage = () => {
  const { id } = useParams<{ id: string }>();
  const currentUserId = useAuthStore(state => state.id);

  const { data: task, isLoading } = useTaskByIdQuery(id ?? null);

  const { mutate: updateTask } = useUpdateTaskMutation();

  const [status, setStatus] = useState<TaskStatus>('PREPARING');
  const [urgent, setUrgent] = useState(false);

  const isOwner = task ? canEditTaskFields(task, currentUserId) : false;
  const canChangeStatus = task ? canEditTaskStatus(task, currentUserId) : false;
  const canEditMedia = task
    ? isTaskOwner(task, currentUserId) || isTaskExecutor(task, currentUserId)
    : false;

  const {
    files,
    images,
    isPending: isMediaSaving,
    setFiles,
    setImages,
    handleRemoveImage,
    handleSaveMedia,
  } = useTaskMediaSave({ task, canEditMedia });

  const { data: contact } = useGetUserByIdQuery(
    (isOwner ? task?.executorId : task?.ownerId) || ''
  );

  useEffect(() => {
    if (!task) return;

    setTimeout(() => {
      setStatus(task.status);
      setUrgent(task.urgent);
    }, 0);
  }, [task]);

  const getStatus = (status: TaskStatus) => {
    switch (status) {
      case TASK_STATUS_ENUM.PREPARING:
        return TASK_STATUS_ENUM.PENDING_APPROVAL;
      case TASK_STATUS_ENUM.PENDING_APPROVAL:
        return TASK_STATUS_ENUM.IN_PROGRESS;
      case TASK_STATUS_ENUM.IN_PROGRESS:
        return TASK_STATUS_ENUM.COMPLETED;
    }
  };

  const handleSave = (formValues: TaskFormType) => {
    if (!task) return;

    const body: UpdateTaskDto = isOwner
      ? {
          status: getStatus(status),
          ...mapFormToUpdateTask(formValues),
          urgent,
        }
      : { status };

    updateTask({ id: task.id, body });
  };

  return (
    <PageLayout title="Задача">
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !task && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 6 }}
        >
          Задача не найдена
        </Typography>
      )}

      {task && (
        <Box
          sx={{
            gap: 2,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '32px',
          }}
        >
          <Stepper
            sx={{
              bgcolor: 'white',
              p: { xs: 3, md: 4 },
              borderRadius: '32px',
            }}
            activeStep={0}
            alternativeLabel
            orientation="horizontal"
          >
            <Step active={status === TASK_STATUS_ENUM.PREPARING}>
              <StepLabel>На подготовке</StepLabel>
            </Step>
            <Step active={status === TASK_STATUS_ENUM.PENDING_APPROVAL}>
              <StepLabel>На согласовании</StepLabel>
            </Step>
            <Step active={status === TASK_STATUS_ENUM.REVISION}>
              <StepLabel>На доработке</StepLabel>
            </Step>
            <Step active={status === TASK_STATUS_ENUM.IN_PROGRESS}>
              <StepLabel>В работе</StepLabel>
            </Step>
            <Step active={status === TASK_STATUS_ENUM.COMPLETED}>
              <StepLabel>Исполнено</StepLabel>
            </Step>
          </Stepper>

          <Box
            sx={{
              width: '100%',
              display: 'flex',
              bgcolor: 'white',
              alignItems: 'end',
              p: { xs: 3, md: 4 },
              borderRadius: '32px',
              justifyContent: 'space-between',
            }}
          >
            <Gallery
              files={files}
              images={images}
              setFiles={setFiles}
              setImages={setImages}
              canUpload={canEditMedia}
              setDeletedFiles={handleRemoveImage}
              canDeleteImage={() => canEditMedia}
            />

            {canEditMedia && (
              <Button
                size="small"
                variant="outlined"
                color="primary"
                loading={isMediaSaving}
                disabled={!files.length || isMediaSaving}
                onClick={handleSaveMedia}
              >
                {isMediaSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            )}
          </Box>

          <Stack
            direction="row"
            spacing={2}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={3}
              sx={{ width: '70%' }}
            >
              <Box
                sx={{
                  flex: 1,
                  bgcolor: 'white',
                  p: { xs: 3, md: 4 },
                  borderRadius: '32px',
                }}
              >
                <TaskForm
                  task={task}
                  isOwner={isOwner}
                  onSubmit={handleSave}
                  canChangeStatus={canChangeStatus}
                />
              </Box>
            </Stack>

            <Stack
              spacing={2}
              direction="column"
              sx={{ width: '30%' }}
            >
              <ContactCard contact={contact?.data} />
              <Activity taskId={task.id} />
            </Stack>
          </Stack>

          <TaskComments
            task={task}
            contact={contact?.data}
          />
        </Box>
      )}
    </PageLayout>
  );
};

export default TaskPage;
