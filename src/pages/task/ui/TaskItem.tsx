import { MoreVert } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import {
  useGetUserByIdQuery,
  canEditTaskFields,
  canEditTaskStatus,
  getIsCompanyAction,
  isTaskExecutor,
  isTaskOverdue,
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
  useConversationsQuery,
  useCreateConversationMutation,
} from '@/entities/chat';
import {
  mapFormToUpdateTask,
  TaskForm,
  Gallery,
  useAuthStore,
  type TaskFormType,
} from '@/features';
import { sendTaskTzToChat } from '@/features/chat';
import { scrollMainToTop } from '@/shared';
import { ConfirmDialog, useSnackbarStore, ContactCard } from '@/widgets';

import { useTaskMediaSave } from '../model/hooks/useTaskMediaSave';

import { Activity } from './Activity';
import { TaskAlertBanner } from './TaskAlertBanner';
import { TaskComments } from './TaskComments';
import { TaskResultDropzone } from './TaskResultDropzone';
import { TaskStatusStepper } from './TaskStatusStepper';

import type { Post } from '@/entities/post';

const finalStatuses = [
  TASK_STATUS_ENUM.IN_PROGRESS,
  TASK_STATUS_ENUM.CHECKING,
  TASK_STATUS_ENUM.COMPLETED,
];

const CANCELLED_STATUSES = [
  TASK_STATUS_ENUM.CANCELLED,
  TASK_STATUS_ENUM.CANCELLED_EXECUTOR,
] as const;

type TaskItemProps = {
  task: Task;
  post?: Post;
  isLoading: boolean;
  isPostLoading?: boolean;
};

export const TaskItem = ({
  task,
  post,
  isLoading,
  isPostLoading = false,
}: TaskItemProps) => {
  const currentUserId = useAuthStore(state => state.id);

  const { setSnackbarOpen } = useSnackbarStore();

  const { mutateAsync: updateTask, isPending: isUpdating } =
    useUpdateTaskMutation();

  const [isEdit, setIsEdit] = useState(false);
  const [status, setStatus] = useState<TaskStatus>('PREPARING');
  const [isOpenCancelDialog, setIsOpenCancelDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isSendingTz, setIsSendingTz] = useState(false);
  const [hiddenCancelForTaskId, setHiddenCancelForTaskId] = useState<
    string | null
  >(null);
  const [hiddenOverdueForTaskId, setHiddenOverdueForTaskId] = useState<
    string | null
  >(null);
  const [activityType, setActivityType] = useState<
    TaskActivityType | undefined
  >(undefined);
  const [activityLimit, setActivityLimit] = useState(20);

  const { data: conversations } = useConversationsQuery(undefined, {
    enabled: Boolean(task?.executorId),
  });
  const { mutateAsync: createConversation } = useCreateConversationMutation();

  useEffect(() => {
    setTimeout(() => {
      setActivityLimit(20);
    }, 0);
  }, [activityType, task?.id]);

  const isOwner = task ? canEditTaskFields(task, currentUserId) : false;

  const canChangeStatus = task
    ? canEditTaskStatus(task, currentUserId) &&
      status !== TASK_STATUS_ENUM.COMPLETED
    : false;

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
      limit: activityLimit,
      type: activityType,
    }
  );

  const activityTotal = data?.total ?? 0;
  const activityItems = data?.items ?? [];
  const hasMoreActivities = activityTotal > activityItems.length;

  const { data: contact } = useGetUserByIdQuery(
    (isOwner ? task?.executorId : task?.ownerId) || ''
  );

  useEffect(() => {
    if (!task) return;

    setTimeout(() => {
      setStatus(task.status);
    }, 0);
  }, [task]);

  const handleUpdateTask = async (body: UpdateTaskDto) => {
    try {
      await updateTask({ id: task.id, body });
      return true;
    } catch {
      setSnackbarOpen?.(
        true,
        'Сохранение данных не удалось. Попробуйте позже',
        'error'
      );
      return false;
    }
  };

  const handleSave = async (
    formValues: TaskFormType,
    newStatus?: TaskStatus
  ): Promise<boolean> => {
    if (!task) return false;

    const body: UpdateTaskDto = {
      ...(isOwner ? mapFormToUpdateTask(formValues) : {}),
      isCompanyAction: getIsCompanyAction(task, isOwner, newStatus),
      ...(newStatus ? { status: newStatus } : {}),
    };

    const isSaved = await handleUpdateTask(body);

    if (!isSaved) return false;

    if (files.length > 0) {
      await handleSaveMedia();
    }

    setIsEdit(false);

    if (body.status) {
      setSnackbarOpen?.(true, 'Статус успешно изменен');
    } else {
      setSnackbarOpen?.(true, 'Данные успешно сохранены');
    }

    requestAnimationFrame(() => {
      scrollMainToTop();
    });

    return true;
  };

  const handleSimpleSaveForm = async (
    formValues: TaskFormType
  ): Promise<boolean> => {
    if (!task) return false;

    const body: UpdateTaskDto = mapFormToUpdateTask(formValues);

    return handleUpdateTask(body);
  };

  const handleCancelTask = async () => {
    if (!task) return;

    await handleUpdateTask({
      status: TASK_STATUS_ENUM.CANCELLED,
    });

    setAnchorEl(null);
    setIsOpenCancelDialog(false);
  };

  const handleCancel = () => {
    handleCancelMedia();
  };

  const handleSendTzToExecutor = useCallback(async () => {
    if (!task?.executorId || isSendingTz) {
      return;
    }

    setIsSendingTz(true);

    try {
      await sendTaskTzToChat({
        task,
        taskId: task.id,
        peerId: task.executorId,
        conversations,
        createConversation: body => createConversation(body),
      });
      setSnackbarOpen?.(true, 'ТЗ отправлено исполнителю');
    } catch {
      setSnackbarOpen?.(
        true,
        'Не удалось отправить ТЗ. Попробуйте позже',
        'error'
      );
    } finally {
      setIsSendingTz(false);
    }
  }, [conversations, createConversation, isSendingTz, setSnackbarOpen, task]);

  const isLoadingTask = isUpdating || isMediaSaving || isReportMediaSaving;
  const isCancelled = CANCELLED_STATUSES.includes(
    status as (typeof CANCELLED_STATUSES)[number]
  );
  const isOverdue = isTaskOverdue(task);
  const isCancelBannerHidden = hiddenCancelForTaskId === task.id;
  const isOverdueBannerHidden = hiddenOverdueForTaskId === task.id;
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

      {status === TASK_STATUS_ENUM.CANCELLED_EXECUTOR &&
        !isCancelBannerHidden && (
          <TaskAlertBanner
            message="Задача отменена исполнителем"
            onClose={() => setHiddenCancelForTaskId(task.id)}
          />
        )}

      {status === TASK_STATUS_ENUM.CANCELLED && !isCancelBannerHidden && (
        <TaskAlertBanner
          message="Задача отменена заказчиком"
          onClose={() => setHiddenCancelForTaskId(task.id)}
        />
      )}

      {isOverdue && !isOverdueBannerHidden && (
        <TaskAlertBanner
          message="Задача просрочена"
          onClose={() => setHiddenOverdueForTaskId(task.id)}
        />
      )}

      {!isCancelled && <TaskStatusStepper status={status} />}

      {task && (
        <Stack spacing={2}>
          <Stack
            spacing={2}
            direction={{ xs: 'column', lg: 'row' }}
            sx={{ alignItems: 'flex-start' }}
          >
            <Stack
              spacing={2}
              sx={{ flex: 1, minWidth: 0, width: '100%' }}
            >
              {Boolean(
                reportFiles.length ||
                reportImages.length ||
                status === TASK_STATUS_ENUM.IN_PROGRESS
              ) && (
                <TaskResultDropzone
                  status={status}
                  postId={task.postId ?? task.post?.id ?? post?.id}
                  postTitle={post?.title ?? task.post?.title}
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

              <Box
                sx={{
                  bgcolor: 'white',
                  p: { xs: 2.5, md: 3 },
                  borderRadius: '32px',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    mb: 3,
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: 'info.main' }}
                  >
                    Техническое задание
                  </Typography>

                  {!isCancelled &&
                    status !== TASK_STATUS_ENUM.COMPLETED &&
                    isOwner && (
                      <Stack
                        direction="row"
                        spacing={1}
                      >
                        {Boolean(task.executorId) && (
                          <Button
                            color="primary"
                            sx={{ px: 2 }}
                            disabled={isSendingTz}
                            onClick={() => void handleSendTzToExecutor()}
                            startIcon={
                              isSendingTz ? (
                                <CircularProgress
                                  size={16}
                                  color="inherit"
                                />
                              ) : undefined
                            }
                          >
                            Отправить исполнителю
                          </Button>
                        )}
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
                          {isEnabledCancel && (
                            <MenuItem
                              onClick={() => setIsOpenCancelDialog(true)}
                            >
                              <Typography color="error">
                                Отменить задачу
                              </Typography>
                            </MenuItem>
                          )}
                        </Menu>
                      </Stack>
                    )}
                </Stack>

                {(canEditMedia || images.length > 0 || files.length > 0) &&
                  !isCancelled && (
                    <Box sx={{ mb: 3 }}>
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

                {isPostLoading && !post ? (
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 4 }}
                  >
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <TaskForm
                    task={task}
                    post={post}
                    isEdit={isEdit}
                    status={status}
                    onSubmit={handleSave}
                    setIsEdit={setIsEdit}
                    isLoading={isLoadingTask}
                    activities={data?.items ?? []}
                    canChangeStatus={canChangeStatus}
                    imagesLength={reportImages.length}
                    isExecutorApprove={task.isExecutorApprove}
                    handleSimpleSaveForm={handleSimpleSaveForm}
                  />
                )}
              </Box>
            </Stack>

            <Stack
              spacing={2}
              sx={{
                width: { xs: '100%', lg: '30%' },
                flexShrink: 0,
                position: { lg: 'sticky' },
                top: { lg: 16 },
              }}
            >
              <ContactCard
                withTitle
                status={status}
                taskId={task.id}
                isMyPost={isOwner}
                contact={contact?.data}
              />

              <Activity
                total={activityTotal}
                ownerId={task.ownerId}
                executorId={task.executorId}
                activityType={activityType}
                activities={activityItems}
                hasMore={hasMoreActivities}
                isLoading={isLoadingActivities}
                setActivityType={setActivityType}
                onLoadMore={() => setActivityLimit(prev => prev + 20)}
              />
            </Stack>
          </Stack>

          <TaskComments
            taskId={task.id}
            isOwner={isOwner}
            contact={contact?.data}
            isExecutorApprove={task.isExecutorApprove}
            disabled={isCancelled || status === TASK_STATUS_ENUM.COMPLETED}
          />
        </Stack>
      )}

      <ConfirmDialog
        title="Отменить задачу"
        isOpen={isOpenCancelDialog}
        isPending={isUpdating}
        onSuccess={handleCancelTask}
        onClose={() => setIsOpenCancelDialog(false)}
        description="Вы уверены, что хотите отменить задачу? Все данные будут удалены."
      />
    </Box>
  );
};

export default TaskItem;
