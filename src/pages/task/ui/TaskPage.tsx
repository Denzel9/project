import { MoreVert } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
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
  isTaskOwner,
  useTaskActivitiesQuery,
  useTaskByIdQuery,
  useUpdateTaskMutation,
  type TaskStatus,
  type UpdateTaskDto,
} from '@/entities/task';
import {
  TASK_STATUS_ENUM,
  TaskActivityType,
} from '@/entities/task/model/types';
import { useGetUserByIdQuery } from '@/entities/user';
import Gallery from '@/features/application-form/ui/Gallery';
import { useAuthStore } from '@/features/auth';
import {
  mapFormToUpdateTask,
  TaskForm,
  type TaskFormType,
} from '@/features/task-form';
import { scrollMainToTop } from '@/shared';
import { ConfirmDialog, PageLayout } from '@/widgets';

import { useTaskMediaSave } from '../model/hooks/useTaskMediaSave';

import { Activity } from './Activity';
import { ContactCard } from './ContactCard';
import { TaskComments } from './TaskComments';

export const TaskPage = () => {
  const { id } = useParams<{ id: string }>();
  const currentUserId = useAuthStore(state => state.id);

  const { data: task, isLoading } = useTaskByIdQuery(id ?? null);

  const { mutateAsync: updateTask, isPending: isUpdating } =
    useUpdateTaskMutation();

  const [isEdit, setIsEdit] = useState(false);
  const [isOpenSnackbar, setIsOpenSnackbar] = useState(false);
  const [status, setStatus] = useState<TaskStatus>('PREPARING');
  const [isOpenDescription, setIsOpenDescription] = useState(false);
  const [isOpenCancelDialog, setIsOpenCancelDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isOpenStatusSnackbar, setIsOpenStatusSnackbar] = useState(false);
  const [activityType, setActivityType] = useState<
    TaskActivityType | undefined
  >(undefined);

  const isOwner = task ? canEditTaskFields(task, currentUserId) : false;
  const canChangeStatus = task ? canEditTaskStatus(task, currentUserId) : false;
  const canEditMedia = task ? isTaskOwner(task, currentUserId) : false;

  const {
    files,
    images,
    setFiles,
    setImages,
    handleSaveMedia,
    handleRemoveImage,
    isPending: isMediaSaving,
  } = useTaskMediaSave({ task, canEditMedia });

  const { data, isLoading: isLoadingActivities } = useTaskActivitiesQuery(
    task?.id ?? '',
    {
      page: 1,
      limit: 20,
      type: activityType,
    }
  );

  const { data: contact } = useGetUserByIdQuery(
    (isOwner ? task?.executorId : task?.ownerId) || ''
  );

  useEffect(() => {
    if (!task) return;

    setTimeout(() => {
      setStatus(task.status);
    }, 0);
  }, [task]);

  const handleSave = async (
    formValues: TaskFormType,
    newStatus?: TaskStatus
  ) => {
    if (!task) return;

    const body: UpdateTaskDto = isOwner ? mapFormToUpdateTask(formValues) : {};

    if (newStatus) {
      body.status = newStatus;
    }

    await updateTask({ id: task.id, body });

    if (files.length > 0) {
      await handleSaveMedia();
    }

    setIsEdit(false);

    if (body['status']) {
      setIsOpenStatusSnackbar(true);
    }

    requestAnimationFrame(() => {
      scrollMainToTop();
    });

    setIsOpenSnackbar(true);
  };

  const handleSimpleSaveForm = async (formValues: TaskFormType) => {
    if (!task) return;

    const body: UpdateTaskDto = mapFormToUpdateTask(formValues);

    await updateTask({ id: task.id, body });
  };

  const handleCancelTask = async () => {
    if (!task) return;

    await updateTask({
      id: task.id,
      body: { status: TASK_STATUS_ENUM.CANCELLED },
    });

    setAnchorEl(null);
    setIsOpenCancelDialog(false);
  };

  const handleCancel = () => {
    setFiles([]);
    setImages([]);
    setIsOpenDescription(false);
  };

  const isLoadingTask = isUpdating || isMediaSaving;
  const isEnabledCancel = [
    TASK_STATUS_ENUM.PREPARING,
    TASK_STATUS_ENUM.PENDING_APPROVAL,
    TASK_STATUS_ENUM.REVISION,
  ].includes(status as TASK_STATUS_ENUM);

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
          color="secondary"
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
            borderRadius: '32px',
            flexDirection: 'column',
          }}
        >
          {status === TASK_STATUS_ENUM.CANCELLED && (
            <Box
              sx={{
                bgcolor: 'white',
                p: { xs: 3, md: 4 },
                borderRadius: '32px',
              }}
            >
              <Typography
                variant="h5"
                color="error"
              >
                Задача отменена
              </Typography>
            </Box>
          )}

          {status !== TASK_STATUS_ENUM.CANCELLED && (
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
              <Step active={status === TASK_STATUS_ENUM.CHECKING}>
                <StepLabel>На проверке</StepLabel>
              </Step>
              <Step active={status === TASK_STATUS_ENUM.COMPLETED}>
                <StepLabel>Исполнено</StepLabel>
              </Step>
            </Stepper>
          )}

          <Stack
            spacing={2}
            direction={{ xs: 'column', lg: 'row' }}
          >
            <Stack
              spacing={2}
              direction="column"
              sx={{
                width: { xs: '100%', lg: '70%' },
              }}
            >
              {status === TASK_STATUS_ENUM.IN_PROGRESS && (
                <Box sx={{ bgcolor: 'white', p: 4, borderRadius: '12px' }}>
                  12
                </Box>
              )}

              <Stack
                spacing={4}
                direction="column"
                sx={{
                  width: '100%',
                  bgcolor: 'white',
                  p: { xs: 3, md: 4 },
                  borderRadius: '32px',
                  height: 'fit-content',
                }}
              >
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between' }}
                >
                  <Typography
                    sx={{
                      mb: 2,
                      fontWeight: 500,
                      fontSize: '24px',
                      color: 'info.main',
                    }}
                  >
                    Техническое задание
                  </Typography>

                  <Box>
                    <IconButton
                      onClick={event =>
                        setAnchorEl(anchorEl ? null : event.currentTarget)
                      }
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => {
                      setAnchorEl(null);
                      setIsOpenCancelDialog(false);
                    }}
                  >
                    {isEnabledCancel && isOwner && (
                      <MenuItem onClick={() => setIsOpenCancelDialog(true)}>
                        <Typography color="error">Отменить задачу</Typography>
                      </MenuItem>
                    )}
                  </Menu>
                </Stack>

                {(canEditMedia || images.length > 0 || files.length > 0) && (
                  <Box sx={{ width: { xs: '100%', md: '70%' } }}>
                    <Gallery
                      files={files}
                      images={images}
                      setFiles={setFiles}
                      setImages={setImages}
                      canUpload={canEditMedia}
                      setDeletedFiles={handleRemoveImage}
                      canDeleteImage={() => canEditMedia}
                    />

                    {Boolean(files.length) && (
                      <Stack
                        spacing={2}
                        direction="row"
                        sx={{ mt: 2 }}
                      >
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={handleCancel}
                          disabled={isMediaSaving}
                        >
                          Отменить
                        </Button>

                        <Button
                          size="small"
                          variant="outlined"
                          loading={isMediaSaving}
                          onClick={handleSaveMedia}
                        >
                          Сохранить
                        </Button>
                      </Stack>
                    )}
                  </Box>
                )}

                <TaskForm
                  task={task}
                  isEdit={isEdit}
                  status={status}
                  onSubmit={handleSave}
                  setIsEdit={setIsEdit}
                  isLoading={isLoadingTask}
                  activities={data?.items ?? []}
                  canChangeStatus={canChangeStatus}
                  isOpenDescription={isOpenDescription}
                  handleSimpleSaveForm={handleSimpleSaveForm}
                  setIsOpenDescription={setIsOpenDescription}
                />
              </Stack>
            </Stack>

            <Stack
              spacing={2}
              direction="column"
              sx={{
                flex: { lg: '0 0 30%' },
                width: { xs: '100%', lg: '30%' },
                minHeight: 0,
                display: 'flex',
              }}
            >
              <ContactCard
                withTitle
                isMyPost={isOwner}
                contact={contact?.data}
              />

              <Activity
                activityType={activityType}
                activities={data?.items ?? []}
                isLoading={isLoadingActivities}
                setActivityType={setActivityType}
              />
            </Stack>
          </Stack>

          <TaskComments
            task={task}
            contact={contact?.data}
          />
        </Box>
      )}

      <Snackbar
        open={isOpenSnackbar}
        autoHideDuration={3000}
        message="Данные успешно сохранены"
        onClose={() => setIsOpenSnackbar(false)}
      />

      <Snackbar
        autoHideDuration={3000}
        open={isOpenStatusSnackbar}
        message="Статус успешно изменен"
        onClose={() => setIsOpenStatusSnackbar(false)}
      />

      <ConfirmDialog
        title="Отменить задачу"
        onSuccess={handleCancelTask}
        isOpen={isOpenCancelDialog}
        onClose={() => setIsOpenCancelDialog(false)}
        description="Вы уверены, что хотите отменить задачу? Все данные будут удалены."
      />
    </PageLayout>
  );
};

export default TaskPage;
