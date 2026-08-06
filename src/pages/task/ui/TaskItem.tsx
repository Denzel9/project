import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
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
  useConfirmTaskAnnulmentMutation,
  useRejectTaskAnnulmentMutation,
  useConfirmTaskDeadlineExtensionMutation,
  useRejectTaskDeadlineExtensionMutation,
  type TaskStatus,
  type UpdateTaskDto,
  type TaskAnnulmentInitiator,
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
import { getActionActorParts, scrollMainToTop } from '@/shared';
import { useSnackbarStore, ContactCard } from '@/widgets';

import { useTaskMediaSave } from '../model/hooks/useTaskMediaSave';

import { Activity } from './activity/Activity';
import { TaskComments } from './comment/TaskComments';
import { SendTzPreviewDialog } from './SendTzPreviewDialog';
import { TaskAlertBanner } from './TaskAlertBanner';
import { TaskResultDropzone } from './TaskResultDropzone';
import { TaskStatusStepper } from './TaskStatusStepper';

import type { Post } from '@/entities/post';

const finalStatuses = [
  TASK_STATUS_ENUM.IN_PROGRESS,
  TASK_STATUS_ENUM.CHECKING,
  TASK_STATUS_ENUM.COMPLETED,
];

const CANCELLED_STATUSES = [TASK_STATUS_ENUM.ANNULLED] as const;

const ANNULMENT_INITIATOR_LABELS: Record<TaskAnnulmentInitiator, string> = {
  CUSTOMER: 'Заказчик',
  EXECUTOR: 'Исполнитель',
  MUTUAL: 'Договорённость сторон',
};

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
  const accountId = useAuthStore(state => state.accountId);

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
  const [status, setStatus] = useState<TaskStatus>('PREPARING');
  const [isSendingTz, setIsSendingTz] = useState(false);
  const [isSendTzPreviewOpen, setIsSendTzPreviewOpen] = useState(false);
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

  const { data: contact } = useGetUserByIdQuery(
    (isOwner ? task?.executorId : task?.ownerId) || ''
  );

  const assignee = getActionActorParts({
    actorDisplayName: task?.assigneeDisplayName,
    actorKind: task?.assigneeKind,
  });

  const visibleAssignee =
    assignee &&
      task?.assigneeAccountId &&
      task.assigneeAccountId !== accountId
      ? assignee
      : null;

  const assigneeInitials = visibleAssignee?.name
    ? visibleAssignee.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('')
    : '?';

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
  }, [conversations, createConversation, isSendingTz, setSnackbarOpen, task]);

  const isLoadingTask = isUpdating || isMediaSaving || isReportMediaSaving;
  const isCancelled = CANCELLED_STATUSES.includes(
    status as (typeof CANCELLED_STATUSES)[number]
  );
  const isOverdue = isTaskOverdue(task);
  const isCancelBannerHidden = hiddenCancelForTaskId === task.id;
  const isOverdueBannerHidden = hiddenOverdueForTaskId === task.id;
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
        `Инициатор: ${ANNULMENT_INITIATOR_LABELS[confirmedAnnulment.initiator]}`,
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
        <Box
          sx={{
            mb: 2,
            bgcolor: 'info.light',
            p: { xs: 2, md: 3 },
            borderRadius: '24px',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 500 }}
          >
            {canRespondToAnnulment
              ? 'Запрошено аннулирование задачи'
              : 'Ожидается подтверждение аннулирования'}
          </Typography>
          {pendingAnnulment.reason && (
            <Typography
              variant="body2"
              sx={{ mt: 1 }}
            >
              Причина: {pendingAnnulment.reason}
            </Typography>
          )}
          {canRespondToAnnulment && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Button
                variant="outlined"
                disabled={isRejectingAnnulment || isConfirmingAnnulment}
                onClick={() => void handleRejectAnnulment()}
              >
                Отклонить
              </Button>
              <Button
                variant="contained"
                loading={isConfirmingAnnulment}
                disabled={isRejectingAnnulment || isConfirmingAnnulment}
                onClick={() => void handleConfirmAnnulment()}
              >
                Подтвердить
              </Button>
            </Stack>
          )}
        </Box>
      )}

      {pendingDeadlineExtension && (
        <Box
          sx={{
            mb: 2,
            bgcolor: 'info.light',
            p: { xs: 2, md: 3 },
            borderRadius: '24px',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 500, }}
          >
            {canRespondToDeadlineExtension
              ? 'Запрошен перенос дедлайна'
              : 'Ожидается подтверждение переноса дедлайна'}
          </Typography>
          {pendingDeadlineExtension.proposedFinalDate && (
            <Typography
              variant="body2"
              sx={{ mt: 1, }}
            >
              Новая дата:{' '}
              {format(
                new Date(pendingDeadlineExtension.proposedFinalDate),
                'dd.MM.yyyy',
                { locale: ru }
              )}
            </Typography>
          )}
          {pendingDeadlineExtension.reason && (
            <Typography
              variant="body2"
              sx={{ mt: 1, }}
            >
              Причина: {pendingDeadlineExtension.reason}
            </Typography>
          )}
          {canRespondToDeadlineExtension && (
            <Stack
              direction="row"
              spacing={2}
              sx={{ mt: 2 }}
            >
              <Button
                variant="outlined"
                disabled={
                  isRejectingDeadlineExtension || isConfirmingDeadlineExtension
                }
                onClick={() => void handleRejectDeadlineExtension()}
              >
                Отклонить
              </Button>
              <Button
                variant="contained"
                color="primary"
                loading={isConfirmingDeadlineExtension}
                disabled={
                  isRejectingDeadlineExtension || isConfirmingDeadlineExtension
                }
                onClick={() => void handleConfirmDeadlineExtension()}
              >
                Подтвердить
              </Button>
            </Stack>
          )}
        </Box>
      )}

      {isOverdue && !isOverdueBannerHidden && (
        <TaskAlertBanner
          message="Задача просрочена"
          onClose={() => setHiddenOverdueForTaskId(task.id)}
        />
      )}

      {!isCancelled && <TaskStatusStepper status={status} />}

      {task && (
        <Stack spacing={1}>
          <Stack
            spacing={1}
            sx={{ alignItems: 'flex-start' }}
            direction={{ xs: 'column', lg: 'row' }}
          >
            <Stack
              spacing={1}
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
                    onRetryLocal={handleRetryReportLocal}
                  />
                )}

              <Box
                sx={{
                  bgcolor: 'white',
                  border: '1px solid',
                  borderRadius: '32px',
                  p: { xs: 2.5, md: 3 },
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
                    isOwner &&
                    Boolean(task.executorId) && (
                      <Button
                        color="primary"
                        sx={{ px: 2 }}
                        disabled={isEdit}
                        onClick={() => setIsSendTzPreviewOpen(true)}
                      >
                        Отправить исполнителю
                      </Button>
                    )}
                </Stack>

                {(Boolean(canEditMedia || images.length || files.length)) && (
                  <Box sx={{ mb: 3 }}>
                    {Boolean(images.length || files.length || isEdit) && <Gallery
                      files={files}
                      images={images}
                      setFiles={setFiles}
                      setImages={setImages}
                      canUpload={canEditMedia && isEdit}
                      setDeletedFiles={handleRemoveImage}
                      canDeleteImage={() => canEditMedia && isEdit}
                      onRetryPrepare={handleRetryLocal}
                    />}

                    {Boolean(files.length) && isEdit && (
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
                          disabled={images.some(
                            image => image.uploadStatus === 'preparing',
                          )}
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
              spacing={1}
              sx={{
                width: { xs: '100%', lg: '30%' },
                flexShrink: 0,
                position: { lg: 'sticky' },
                top: { lg: 16 },
              }}
            >
              {visibleAssignee && (
                <Box
                  sx={{
                    height: 'fit-content',
                    bgcolor: 'white',
                    borderRadius: '32px',
                    p: { xs: 2.5, md: 3 },
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Chip
                    size="small"
                    label="Ответственный"
                    sx={{
                      mb: 2,
                      fontWeight: 600,
                      bgcolor: 'info.light',
                      color: 'primary.main',
                    }}
                  />

                  <Stack
                    spacing={1.25}
                    sx={{ alignItems: 'center', textAlign: 'center' }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        fontWeight: 700,
                        fontSize: 18,
                        bgcolor:
                          task.assigneeKind === 'MANAGER'
                            ? 'primary.main'
                            : 'info.main',
                        color: 'common.white',
                      }}
                    >
                      {assigneeInitials}
                    </Avatar>

                    {visibleAssignee.kindLabel && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          letterSpacing: 0.4,
                          textTransform: 'uppercase',
                          fontWeight: 600,
                        }}
                      >
                        {visibleAssignee.kindLabel}
                      </Typography>
                    )}

                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, lineHeight: 1.3 }}
                    >
                      {visibleAssignee.name}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <ContactCard
                withTitle
                status={status}
                taskId={task.id}
                isMyPost={isOwner}
                contact={contact?.data}
                isExecutorApprove={task.isExecutorApprove}
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
                annulments={task.annulments}
                deadlineExtensions={task.deadlineExtensions}
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

      <SendTzPreviewDialog
        open={isSendTzPreviewOpen}
        task={task}
        isSending={isSendingTz}
        onClose={() => setIsSendTzPreviewOpen(false)}
        onConfirm={() => void handleSendTzToExecutor()}
      />
    </Box>
  );
};

export default TaskItem;
