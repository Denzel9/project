import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useGetUserByIdQuery,
  canEditTaskFields,
  canEditTaskStatus,
  executorToUserPartial,
  getIsCompanyAction,
  isTaskExecutor,
  isTaskOverdue,
  isTaskOwner,
  useTaskActivitiesQuery,
  useUpdateTaskMutation,
  useConfirmTaskAnnulmentMutation,
  useRejectTaskAnnulmentMutation,
  useConfirmTaskDeadlineExtensionMutation,
  useRejectTaskDeadlineExtensionMutation,
  type TaskStatus,
  type UpdateTaskDto,
  type User,
  TASK_STATUS_ENUM,
  TASK_REQUEST_INITIATOR_LABELS,
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
import { getTaskPath } from '@/pages/my-tasks/model/utils/utils';
import { scrollMainToTop } from '@/shared';
import { hasPreparingMedia } from '@/shared/lib/media';
import { useSnackbarStore, ContactCard } from '@/widgets';

import { useTaskMediaSave } from '../model/hooks/useTaskMediaSave';

import { Activity } from './activity/Activity';
import { TaskComments } from './comment/TaskComments';
import { RequestDeadlineExtensionDialog } from './RequestDeadlineExtensionDialog';
import { SendTzPreviewDialog } from './SendTzPreviewDialog';
import { TaskAlertBanner } from './TaskAlertBanner';
import { TaskAssigneeCard } from './TaskAssigneeCard';
import { TaskPendingRequestBanner } from './TaskPendingRequestBanner';
import { TaskResultDropzone } from './TaskResultDropzone';
import { TaskStatusStepper } from './TaskStatusStepper';

import type { Post } from '@/entities/post';

const finalStatuses = [
  TASK_STATUS_ENUM.IN_PROGRESS,
  TASK_STATUS_ENUM.CHECKING,
  TASK_STATUS_ENUM.COMPLETED,
];

const CANCELLED_STATUSES = [TASK_STATUS_ENUM.ANNULLED] as const;

type TaskItemProps = {
  task: Task;
  post?: Post;
  isLoading: boolean;
  isPostLoading?: boolean;
  editRequestId?: number;
};

export const TaskItem = ({
  task,
  post,
  isLoading,
  isPostLoading = false,
  editRequestId = 0,
}: TaskItemProps) => {
  const currentUserId = useAuthStore(state => state.id);

  const navigate = useNavigate();

  const { setSnackbarOpen } = useSnackbarStore();

  const { mutateAsync: updateTask, isPending: isUpdating } =
    useUpdateTaskMutation();
  const { mutateAsync: confirmAnnulment, isPending: isConfirmingAnnulment } =
    useConfirmTaskAnnulmentMutation();
  const { mutateAsync: rejectAnnulment, isPending: isRejectingAnnulment } =
    useRejectTaskAnnulmentMutation();
  const {
    mutateAsync: confirmDeadlineExtension,
    isPending: isConfirmingDeadlineExtension,
  } = useConfirmTaskDeadlineExtensionMutation();
  const {
    mutateAsync: rejectDeadlineExtension,
    isPending: isRejectingDeadlineExtension,
  } = useRejectTaskDeadlineExtensionMutation();

  const [isEdit, setIsEdit] = useState(false);
  const [seenEditRequestId, setSeenEditRequestId] = useState(editRequestId);
  const [status, setStatus] = useState<TaskStatus>('PREPARING');
  const [isSendingTz, setIsSendingTz] = useState(false);
  const [isSendTzPreviewOpen, setIsSendTzPreviewOpen] = useState(false);
  const [hiddenCancelForTaskId, setHiddenCancelForTaskId] = useState<
    string | null
  >(null);
  const [hiddenOverdueForTaskId, setHiddenOverdueForTaskId] = useState<
    string | null
  >(null);
  const [hiddenRejectedForTaskId, setHiddenRejectedForTaskId] = useState<
    string | null
  >(null);
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState<
    TaskActivityType | undefined
  >(undefined);
  const [activityLimit, setActivityLimit] = useState(20);

  if (editRequestId !== seenEditRequestId) {
    setSeenEditRequestId(editRequestId);

    if (editRequestId > seenEditRequestId) {
      setIsEdit(true);
    }
  }

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
    !finalStatuses.includes(status as TASK_STATUS_ENUM) &&
    status !== TASK_STATUS_ENUM.ANNULLED
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
    handleRetryLocal,
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
    handleRetryLocal: handleRetryReportLocal,
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

  const contactUserId = (isOwner ? task?.executorId : task?.ownerId) || '';
  const { data: contact } = useGetUserByIdQuery(contactUserId || null);
  const resolvedContact =
    contact?.data ??
    (isOwner ? (executorToUserPartial(task?.executor) as User | undefined) : undefined);

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

    if (hasPreparingMedia(images)) {
      setSnackbarOpen?.(
        true,
        'Дождитесь обработки фото и сохраните задачу ещё раз',
        'error'
      );
      return false;
    }

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

    if (hasPreparingMedia(images)) {
      setSnackbarOpen?.(
        true,
        'Дождитесь обработки фото и сохраните задачу ещё раз',
        'error'
      );
      return false;
    }

    const isSaved = await handleUpdateTask(body);

    if (!isSaved) return false;

    if (files.length > 0) {
      await handleSaveMedia();
    }

    return true;
  };

  const handleSendTzToExecutor = useCallback(async () => {
    if (
      !task?.executorId ||
      task.isArchived ||
      isSendingTz ||
      status !== TASK_STATUS_ENUM.PENDING_APPROVAL
    ) {
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
      setIsSendTzPreviewOpen(false);
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
  }, [
    conversations,
    createConversation,
    isSendingTz,
    setSnackbarOpen,
    status,
    task,
  ]);

  const handleUnarchive = async () => {
    if (!task || !isOwner || isUpdating) return;

    try {
      await updateTask({
        id: task.id,
        body: { isArchived: false },
      });
      setSnackbarOpen?.(true, 'Задача возвращена из архива');
      navigate(getTaskPath({ ...task, isArchived: false }), { replace: true });
    } catch {
      setSnackbarOpen?.(true, 'Не удалось вернуть задачу из архива', 'error');
    }
  };

  const isLoadingTask =
    isUpdating ||
    isMediaSaving ||
    isReportMediaSaving ||
    hasPreparingMedia(images);
  const isCancelled = CANCELLED_STATUSES.includes(
    status as (typeof CANCELLED_STATUSES)[number]
  );
  const isOverdue = isTaskOverdue(task);
  const isCancelBannerHidden = hiddenCancelForTaskId === task.id;
  const isOverdueBannerHidden = hiddenOverdueForTaskId === task.id;
  const isRejectedBannerHidden = hiddenRejectedForTaskId === task.id;
  const pendingAnnulment =
    task.annulment?.status === 'PENDING' ? task.annulment : null;
  const confirmedAnnulment =
    task.annulments
      ?.filter(item => item.status === 'CONFIRMED')
      .sort(
        (a, b) =>
          new Date(b.confirmedAt ?? b.requestedAt).getTime() -
          new Date(a.confirmedAt ?? a.requestedAt).getTime(),
      )[0] ??
    (task.annulment?.status === 'CONFIRMED' ? task.annulment : null);
  const annulmentBannerDetails = confirmedAnnulment
    ? [
      `Инициатор: ${TASK_REQUEST_INITIATOR_LABELS[confirmedAnnulment.initiator]}`,
      confirmedAnnulment.reason.trim()
        ? `Причина: ${confirmedAnnulment.reason.trim()}`
        : null,
      `Дата: ${format(
        new Date(
          confirmedAnnulment.confirmedAt ?? confirmedAnnulment.requestedAt,
        ),
        'd MMMM yyyy, HH:mm',
        { locale: ru },
      )}`,
    ].filter((item): item is string => Boolean(item))
    : undefined;
  const canRespondToAnnulment =
    Boolean(pendingAnnulment) &&
    pendingAnnulment?.requestedById !== currentUserId &&
    (task.ownerId === currentUserId || task.executorId === currentUserId);

  const pendingDeadlineExtension =
    task.deadlineExtension?.status === 'PENDING'
      ? task.deadlineExtension
      : null;
  const canRespondToDeadlineExtension =
    Boolean(pendingDeadlineExtension) &&
    pendingDeadlineExtension?.requestedById !== currentUserId &&
    (task.ownerId === currentUserId || task.executorId === currentUserId);
  const canRequestDeadlineExtension = Boolean(
    !task.isArchived &&
    task.status !== TASK_STATUS_ENUM.ANNULLED &&
    task.status !== TASK_STATUS_ENUM.COMPLETED &&
    task.executorId &&
    !pendingDeadlineExtension &&
    (isOwner || isTaskExecutor(task, currentUserId)),
  );

  const handleConfirmAnnulment = async () => {
    try {
      await confirmAnnulment(task.id);
      setSnackbarOpen?.(true, 'Задача аннулирована');
    } catch {
      setSnackbarOpen?.(
        true,
        'Не удалось подтвердить аннулирование',
        'error'
      );
    }
  };

  const handleRejectAnnulment = async () => {
    try {
      await rejectAnnulment(task.id);
      setSnackbarOpen?.(true, 'Запрос на аннулирование отклонён');
    } catch {
      setSnackbarOpen?.(true, 'Не удалось отклонить запрос', 'error');
    }
  };

  const handleConfirmDeadlineExtension = async () => {
    try {
      await confirmDeadlineExtension(task.id);
      setSnackbarOpen?.(true, 'Дедлайн перенесён');
    } catch {
      setSnackbarOpen?.(
        true,
        'Не удалось подтвердить перенос дедлайна',
        'error'
      );
    }
  };

  const handleRejectDeadlineExtension = async () => {
    try {
      await rejectDeadlineExtension(task.id);
      setSnackbarOpen?.(true, 'Запрос на перенос дедлайна отклонён');
    } catch {
      setSnackbarOpen?.(true, 'Не удалось отклонить запрос', 'error');
    }
  };

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

      {status === TASK_STATUS_ENUM.ANNULLED && !isCancelBannerHidden && (
        <TaskAlertBanner
          message="Задача аннулирована"
          details={annulmentBannerDetails}
          onClose={() => setHiddenCancelForTaskId(task.id)}
        />
      )}

      {pendingAnnulment && (
        <TaskPendingRequestBanner
          title={
            canRespondToAnnulment
              ? 'Запрошено аннулирование задачи'
              : 'Ожидается подтверждение аннулирования'
          }
          initiator={pendingAnnulment.initiator}
          reason={pendingAnnulment.reason}
          canRespond={canRespondToAnnulment}
          isConfirming={isConfirmingAnnulment}
          isRejecting={isRejectingAnnulment}
          onConfirm={() => void handleConfirmAnnulment()}
          onReject={() => void handleRejectAnnulment()}
        />
      )}

      {pendingDeadlineExtension && (
        <TaskPendingRequestBanner
          title={
            canRespondToDeadlineExtension
              ? 'Запрошен перенос дедлайна'
              : 'Ожидается подтверждение переноса дедлайна'
          }
          reason={pendingDeadlineExtension.reason}
          onReject={handleRejectDeadlineExtension}
          canRespond={canRespondToDeadlineExtension}
          isRejecting={isRejectingDeadlineExtension}
          onConfirm={handleConfirmDeadlineExtension}
          isConfirming={isConfirmingDeadlineExtension}
          initiator={pendingDeadlineExtension.initiator}
          proposedFinalDate={pendingDeadlineExtension.proposedFinalDate}
        />
      )}

      {isOverdue && !isOverdueBannerHidden && (
        <TaskAlertBanner
          message="Задача просрочена"
          onClose={() => setHiddenOverdueForTaskId(task.id)}
          action={
            canRequestDeadlineExtension ? (
              <Button
                sx={{ px: 2, flexShrink: 0 }}
                variant='outlined'
                color="secondary"
                size="small"
                onClick={() => setIsDeadlineDialogOpen(true)}
              >
                Перенести дедлайн
              </Button>
            ) : undefined
          }
        />
      )}

      {task.isExecutorApprove === false && !isRejectedBannerHidden && (
        <TaskAlertBanner
          message="Задача отклонена исполнителем"
          onClose={() => setHiddenRejectedForTaskId(task.id)}
        />
      )}

      {task.isArchived ? (
        <Box
          sx={{
            p: 2,
            mb: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderRadius: '24px',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h6" color="info" sx={{ fontWeight: 600 }}>
              Задача в архиве
            </Typography>

            {isOwner && (
              <Button
                color="primary"
                sx={{ px: { xs: 0, md: 2 }, flexShrink: 0 }}
                disabled={isUpdating}
                onClick={() => void handleUnarchive()}
              >
                Вернуть из архива
              </Button>
            )}
          </Stack>
        </Box>
      ) : (
        !isCancelled && <TaskStatusStepper status={status} />
      )}

      {task && (
        <Stack spacing={1}>
          <Stack
            spacing={1}
            sx={{ alignItems: 'flex-start' }}
            direction={{ xs: 'column', lg: 'row' }}
          >
            <Stack
              spacing={1}
              sx={{
                flex: 1, minWidth: 0, width: '100%', top: { lg: 16 },
                position: { lg: 'sticky' },
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
                    deadline={task.finalDate}
                    setFiles={setReportFiles}
                    setImages={setReportImages}
                    isSaving={isReportMediaSaving}
                    canUpload={canEditReportMedia}
                    onSave={handleSaveReportMedia}
                    onCancel={handleCancelReportMedia}
                    onRetryLocal={handleRetryReportLocal}
                    onRemoveUploaded={handleRemoveReportImage}
                    postTitle={post?.title ?? task.post?.title}
                    postId={task.postId ?? task.post?.id ?? post?.id}
                    deliverables={task.deliverables}
                  />
                )}

              <Box
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderRadius: '32px',
                  p: { xs: 2.5, md: 2 },
                  borderColor: 'divider',
                }}
              >
                <Stack
                  direction={{ xs: 'column', md: "row" }}
                  sx={{
                    mb: 3,
                    alignItems: { xs: 'flex-start', md: 'center' },
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
                    !task.isArchived &&
                    status === TASK_STATUS_ENUM.PENDING_APPROVAL &&
                    isOwner &&
                    Boolean(task.executorId) &&
                    task.isExecutorApprove === true && (
                      <Button
                        color="primary"
                        sx={{ px: { xs: 0, md: 2 } }}
                        disabled={isEdit}
                        onClick={() => setIsSendTzPreviewOpen(true)}
                      >
                        Отправить исполнителю
                      </Button>
                    )}
                </Stack>

                {(Boolean(canEditMedia || images.length || files.length)) && (
                  <Box sx={{ mb: 3 }}>
                    {Boolean(images.length || files.length || isEdit) &&
                      <Gallery
                        files={files}
                        images={images}
                        setFiles={setFiles}
                        setImages={setImages}
                        canUpload={canEditMedia && isEdit}
                        setDeletedFiles={handleRemoveImage}
                        canDeleteImage={() => canEditMedia && isEdit}
                        onRetryPrepare={handleRetryLocal}
                      />
                    }
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
                    onCancelEdit={handleCancelMedia}
                  />
                )}
              </Box>
            </Stack>

            <Stack
              spacing={1}
              sx={{
                top: { lg: 16 },
                position: { lg: 'sticky' },
                width: { xs: '100%', lg: '30%' },
              }}
            >
              <TaskAssigneeCard
                taskId={task.id}
                ownerId={task.ownerId}
                assigneeKind={task.assigneeKind}
                assigneeUserId={task.assigneeUserId}
                assigneeAccountId={task.assigneeAccountId}
                assigneeDisplayName={task.assigneeDisplayName}
              />

              <ContactCard
                withTitle
                status={status}
                taskId={task.id}
                isMyPost={isOwner}
                contact={resolvedContact}
                isContactLoading={Boolean(contactUserId) && !resolvedContact}
                isExecutorApprove={task.isExecutorApprove}
              />

              <Activity
                total={activityTotal}
                ownerId={task.ownerId}
                activities={activityItems}
                activityType={activityType}
                hasMore={hasMoreActivities}
                executorId={task.executorId}
                annulments={task.annulments}
                isLoading={isLoadingActivities}
                setActivityType={setActivityType}
                deadlineExtensions={task.deadlineExtensions}
                onLoadMore={() => setActivityLimit(prev => prev + 20)}
              />
            </Stack>
          </Stack>

          <TaskComments
            taskId={task.id}
            contact={resolvedContact}
            isExecutorApprove={task.isExecutorApprove}
            isArchived={Boolean(task.isArchived)}
            disabled={isCancelled || status === TASK_STATUS_ENUM.COMPLETED}
          />
        </Stack>
      )
      }

      <SendTzPreviewDialog
        open={isSendTzPreviewOpen}
        task={task}
        isSending={isSendingTz}
        onClose={() => setIsSendTzPreviewOpen(false)}
        onConfirm={() => void handleSendTzToExecutor()}
      />

      <RequestDeadlineExtensionDialog
        open={isDeadlineDialogOpen && Boolean(task.id)}
        taskId={task.id}
        currentFinalDate={task.finalDate}
        onClose={() => setIsDeadlineDialogOpen(false)}
      />
    </Box >
  );
};

export default TaskItem;
