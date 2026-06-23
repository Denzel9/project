import { MoreVert } from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import {
  useGetUserByIdQuery,
  canEditTaskFields,
  canEditTaskStatus,
  isTaskExecutor,
  isTaskOwner,
  useTaskActivitiesQuery,
  useUpdateTaskMutation,
  type TaskStatus,
  type UpdateTaskDto,
  TASK_STATUS_ENUM,
  TaskActivityType,
  type Task,
} from '@/entities';
import {
  mapFormToUpdateTask,
  TaskForm,
  Gallery,
  useAuthStore,
  type TaskFormType,
} from '@/features';
import { scrollMainToTop } from '@/shared';
import { ConfirmDialog, useSnackbarStore, ContactCard } from '@/widgets';

import { useTaskMediaSave } from '../model/hooks/useTaskMediaSave';

import { Activity } from './Activity';
import { TaskComments } from './TaskComments';
import { TaskResultDropzone } from './TaskResultDropzone';

const finalStatuses = [
  TASK_STATUS_ENUM.IN_PROGRESS,
  TASK_STATUS_ENUM.CHECKING,
  TASK_STATUS_ENUM.COMPLETED,
];

export const TaskItem = ({
  task,
  isLoading,
}: {
  task: Task;
  isLoading: boolean;
}) => {
  const currentUserId = useAuthStore(state => state.id);

  const { setSnackbarOpen } = useSnackbarStore();

  const { mutateAsync: updateTask, isPending: isUpdating } =
    useUpdateTaskMutation();

  const [isEdit, setIsEdit] = useState(false);
  const [status, setStatus] = useState<TaskStatus>('PREPARING');
  const [isOpenDescription, setIsOpenDescription] = useState(false);
  const [isOpenCancelDialog, setIsOpenCancelDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activityType, setActivityType] = useState<
    TaskActivityType | undefined
  >(undefined);

  const isOwner = task ? canEditTaskFields(task, currentUserId) : false;
  const canChangeStatus = task ? canEditTaskStatus(task, currentUserId) : false;
  const canEditMedia = task
    ? isTaskOwner(task, currentUserId) &&
      !finalStatuses.includes(status as TASK_STATUS_ENUM)
    : false;
  const canEditReportMedia = isTaskExecutor(task, currentUserId);

  const {
    files,
    images,
    setFiles,
    setImages,
    handleSaveMedia,
    handleRemoveImage,
    handleCancel: handleCancelMedia,
    isPending: isMediaSaving,
  } = useTaskMediaSave({ task, canEditMedia, kind: 'main' });

  const {
    files: reportFiles,
    images: reportImages,
    setFiles: setReportFiles,
    setImages: setReportImages,
    handleSaveMedia: handleSaveReportMedia,
    handleRemoveImage: handleRemoveReportImage,
    handleCancel: handleCancelReportMedia,
    isPending: isReportMediaSaving,
  } = useTaskMediaSave({
    task,
    kind: 'report',
    canEditMedia: canEditReportMedia,
  });

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
      setSnackbarOpen?.(true, 'Статус успешно изменен');
    }

    requestAnimationFrame(() => {
      scrollMainToTop();
    });

    setSnackbarOpen?.(true, 'Данные успешно сохранены');
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
    handleCancelMedia();
    setIsOpenDescription(false);
  };

  const isLoadingTask = isUpdating || isMediaSaving || isReportMediaSaving;
  const isEnabledCancel = [
    TASK_STATUS_ENUM.PREPARING,
    TASK_STATUS_ENUM.PENDING_APPROVAL,
    TASK_STATUS_ENUM.REVISION,
  ].includes(status as TASK_STATUS_ENUM);

  return (
    <Box>
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

          {status === TASK_STATUS_ENUM.CANCELLED_EXECUTOR && (
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
                Задача отменена исполнителем
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
              {Boolean(
                reportFiles.length ||
                reportImages.length ||
                status === TASK_STATUS_ENUM.IN_PROGRESS
              ) && (
                <TaskResultDropzone
                  status={status}
                  files={reportFiles}
                  images={reportImages}
                  setFiles={setReportFiles}
                  setImages={setReportImages}
                  isSaving={isReportMediaSaving}
                  canUpload={canEditReportMedia}
                  onSave={handleSaveReportMedia}
                  onCancel={handleCancelReportMedia}
                  onRemoveUploaded={handleRemoveReportImage}
                />
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
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
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
                    {task.isExecutorApprove === false && (
                      <Chip
                        label="Отклонено"
                        color="error"
                      />
                    )}
                  </Stack>

                  {status !== TASK_STATUS_ENUM.CANCELLED && (
                    <>
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
                            <Typography color="error">
                              Отменить задачу
                            </Typography>
                          </MenuItem>
                        )}
                      </Menu>
                    </>
                  )}
                </Stack>

                {(canEditMedia || images.length > 0 || files.length > 0) &&
                  status !== TASK_STATUS_ENUM.CANCELLED && (
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
                  imagesLength={reportImages.length}
                  isOpenDescription={isOpenDescription}
                  isExecutorApprove={task.isExecutorApprove}
                  handleSimpleSaveForm={handleSimpleSaveForm}
                  setIsOpenDescription={setIsOpenDescription}
                />
              </Stack>
            </Stack>

            <Stack
              spacing={2}
              direction="column"
              sx={{
                minHeight: 0,
                display: 'flex',
                flex: { lg: '0 0 30%' },
                width: { xs: '100%', lg: '30%' },
              }}
            >
              <ContactCard
                withTitle
                status={status}
                taskId={task.id}
                isMyPost={isOwner}
                contact={contact?.data}
                isExecutorApprove={task.isExecutorApprove}
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
            taskId={task.id}
            contact={contact?.data}
            comments={task.comments ?? []}
            isExecutorApprove={task.isExecutorApprove}
          />
        </Box>
      )}

      <ConfirmDialog
        title="Отменить задачу"
        isOpen={isOpenCancelDialog}
        onSuccess={handleCancelTask}
        onClose={() => setIsOpenCancelDialog(false)}
        description="Вы уверены, что хотите отменить задачу? Все данные будут удалены."
      />
    </Box>
  );
};

export default TaskItem;
