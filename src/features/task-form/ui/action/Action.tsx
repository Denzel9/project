import { InfoOutlined } from '@mui/icons-material';
import { Stack, Button, Box, Typography } from '@mui/material';
import { useEffect, useMemo, type MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  canTransitionTaskStatus,
  getAllowedTaskStatusTransitions,
  TASK_STATUS_ENUM,
  TaskActivityType,
  useUpdateTaskMutation,
  type TaskActivity,
  type TaskStatus,
} from '@/entities';
import { useAuthStore } from '@/features';
import { useSnackbarStore } from '@/widgets';

import { PendingInvite } from './PendingInvite';
import { RejectInvite } from './RejectInvite';

type ActionProps = {
  taskId: string;
  isEdit: boolean;
  status: TaskStatus;
  isLoading: boolean;
  isSaving?: boolean;
  executorId?: string;
  taskOwnerId: string;
  activities: TaskActivity[];
  isExecutorApprove?: boolean | null;
  isCompanyAction?: boolean;

  handleCancel: () => void;
  handleGoToRevision: () => void;
  handleCompleteTask: () => void;
  handleEdit: (isEdit: boolean) => void;
  handleSubmitForm: (newStatus?: TaskStatus) => void;
  handleSave: (e: MouseEvent<HTMLButtonElement>) => void;
};

const WAITING_LABELS: Partial<Record<TaskStatus, string>> = {
  [TASK_STATUS_ENUM.PREPARING]: 'Подготовка',
  [TASK_STATUS_ENUM.PENDING_APPROVAL]: 'Ожидается согласование',
  [TASK_STATUS_ENUM.REVISION]: 'На доработке',
  [TASK_STATUS_ENUM.IN_PROGRESS]: 'В работе',
  [TASK_STATUS_ENUM.CHECKING]: 'На проверке',
};

const getForwardActionLabel = (toStatus: TaskStatus): string => {
  switch (toStatus) {
    case TASK_STATUS_ENUM.PENDING_APPROVAL:
      return 'На согласование';
    case TASK_STATUS_ENUM.IN_PROGRESS:
      return 'В работу';
    case TASK_STATUS_ENUM.CHECKING:
      return 'На проверку';
    case TASK_STATUS_ENUM.COMPLETED:
      return 'Завершить';
    default:
      return 'Далее';
  }
};

export const Action = ({
  taskId,
  status,
  isEdit,
  isLoading,
  isSaving = false,
  activities,
  executorId,
  handleSave,
  handleEdit,
  handleCancel,
  taskOwnerId,
  handleSubmitForm,
  isExecutorApprove,
  isCompanyAction = false,
  handleGoToRevision,
}: ActionProps) => {
  const { setSnackbarOpen } = useSnackbarStore();

  const { id } = useAuthStore();

  const {
    formState: { errors },
    clearErrors,
  } = useFormContext();

  const { mutateAsync: updateTask } = useUpdateTaskMutation();

  const lastActivitiesStatus = useMemo(
    () =>
      activities
        .filter(activity => activity.type === TaskActivityType.STATUS_CHANGED)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0],
    [activities],
  );

  const isMe = id === taskOwnerId;

  const transitionTask = useMemo(
    () => ({
      status,
      ownerId: taskOwnerId,
      executorId: executorId ?? null,
      isExecutorApprove: isExecutorApprove ?? null,
      isCompanyAction,
    }),
    [
      status,
      taskOwnerId,
      executorId,
      isExecutorApprove,
      isCompanyAction,
    ],
  );

  const transitionOptions = useMemo(
    () => ({
      lastStatusActorId: lastActivitiesStatus?.actorId,
    }),
    [lastActivitiesStatus?.actorId],
  );

  const getSaveButtonConditions = () => {
    const allowed = getAllowedTaskStatusTransitions(
      transitionTask,
      id ?? null,
      transitionOptions,
    );
    const forward = allowed.find(
      nextStatus => nextStatus !== TASK_STATUS_ENUM.REVISION,
    );

    if (forward) {
      return {
        label: getForwardActionLabel(forward),
        isDisabled: false,
        status: forward,
      };
    }

    return {
      label: WAITING_LABELS[status] ?? 'Далее',
      isDisabled: true,
    };
  };

  const { label, isDisabled, status: newStatus } = getSaveButtonConditions();

  const isSaveEnabled = ![
    TASK_STATUS_ENUM.ANNULLED,
    TASK_STATUS_ENUM.COMPLETED,
  ].includes(status as TASK_STATUS_ENUM);

  const isRevisionEnabled = canTransitionTaskStatus(
    transitionTask,
    id ?? null,
    TASK_STATUS_ENUM.REVISION,
    transitionOptions,
  );

  const isEditEnabled =
    (status === TASK_STATUS_ENUM.PREPARING && isMe) ||
    status === TASK_STATUS_ENUM.REVISION;

  useEffect(() => {
    if (Object.keys(errors).length) {
      setTimeout(() => {
        setSnackbarOpen?.(true, String(errors.description?.message));
      }, 0);

      setTimeout(() => {
        clearErrors('description');
      }, 3000);
    }
  }, [clearErrors, errors, setSnackbarOpen]);

  if (isExecutorApprove === null && !isMe) {
    return (
      <PendingInvite
        taskId={taskId}
        updateTask={updateTask}
      />
    );
  }

  if (isExecutorApprove !== null && !isExecutorApprove) {
    return (
      <RejectInvite
        isMe={isMe}
        taskId={taskId}
        updateTask={updateTask}
      />
    );
  }

  return (
    <Box>
      <Stack
        spacing={2}
        sx={{ mt: 3 }}
        direction="row"
      >
        {!isEdit && (
          <>
            {isSaveEnabled && (
              <Button
                size="small"
                variant="contained"
                loading={isLoading}
                disabled={
                  isLoading || isDisabled || !executorId || !isExecutorApprove
                }
                onClick={() => handleSubmitForm(newStatus)}
              >
                {label}
              </Button>
            )}

            {isRevisionEnabled && (
              <Button
                size="small"
                color="error"
                variant="outlined"
                loading={isLoading}
                disabled={isLoading}
                onClick={handleGoToRevision}
              >
                На доработку
              </Button>
            )}
          </>
        )}

        {isEdit && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={isSaving}
            onClick={handleCancel}
          >
            Отменить
          </Button>
        )}

        {isEditEnabled && (
          <>
            {isEdit ? (
              <Button
                size="small"
                color="primary"
                variant="outlined"
                loading={isSaving}
                disabled={isSaving}
                onClick={handleSave}
              >
                Сохранить
              </Button>
            ) : isMe ? (
              <Button
                size="small"
                color="primary"
                variant="outlined"
                onClick={() => handleEdit(true)}
              >
                Редактировать
              </Button>
            ) : null}
          </>
        )}
      </Stack>

      {isExecutorApprove === null && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 2, alignItems: 'center' }}
        >
          <InfoOutlined color="info" />
          <Typography
            variant="body2"
            color="info"
          >
            Смена статуса будет доступна после одобрения задачи
          </Typography>
        </Stack>
      )}
    </Box>
  );
};
