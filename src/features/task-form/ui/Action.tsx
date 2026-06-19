import { Stack, Button, CircularProgress, Snackbar } from '@mui/material';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { useFormContext } from 'react-hook-form';

import {
  TASK_STATUS_ENUM,
  TaskActivityType,
  type TaskActivity,
  type TaskStatus,
} from '@/entities/task';
import { useAuthStore } from '@/features/auth';

type ActionProps = {
  isEdit: boolean;
  status: TaskStatus;
  isLoading: boolean;
  taskOwnerId: string;
  activities: TaskActivity[];
  handleGoToRevision: () => void;
  handleCompleteTask: () => void;
  handleEdit: (isEdit: boolean) => void;
  handleSubmitForm: (newStatus?: TaskStatus) => void;
  handleSave: (e: MouseEvent<HTMLButtonElement>) => void;
};

export const Action = ({
  status,
  isEdit,
  isLoading,
  activities,
  handleSave,
  handleEdit,
  taskOwnerId,
  handleSubmitForm,
  handleGoToRevision,
}: ActionProps) => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
  });

  const { id } = useAuthStore();

  const {
    formState: { errors },
    clearErrors,
  } = useFormContext();

  const lastActivitiesStatus = useMemo(
    () =>
      activities
        .filter(activity => activity.type === TaskActivityType.STATUS_CHANGED)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0],
    [activities]
  );

  const isMe = id === taskOwnerId;
  const isMeLastActor = lastActivitiesStatus?.actorId === id;

  const getSaveButtonConditions = () => {
    switch (status) {
      case TASK_STATUS_ENUM.PREPARING:
        return isMe
          ? {
              label: 'На согласование',
              isDisabled: false,
              status: TASK_STATUS_ENUM.PENDING_APPROVAL,
            }
          : { label: 'Подготовка', isDisabled: true };
      case TASK_STATUS_ENUM.PENDING_APPROVAL:
        return isMeLastActor
          ? { label: 'Ожидается согласование', isDisabled: true }
          : {
              label: 'В работу',
              isDisabled: false,
              status: TASK_STATUS_ENUM.IN_PROGRESS,
            };
      case TASK_STATUS_ENUM.REVISION:
        return isMeLastActor
          ? { label: 'На доработке', isDisabled: true }
          : {
              label: isMe ? 'На согласование' : 'В работу',
              isDisabled: false,
              status: isMe
                ? TASK_STATUS_ENUM.PENDING_APPROVAL
                : TASK_STATUS_ENUM.IN_PROGRESS,
            };
      case TASK_STATUS_ENUM.IN_PROGRESS:
        return isMe
          ? { label: 'В работе', isDisabled: true }
          : {
              label: 'На проверку',
              isDisabled: false,
              status: TASK_STATUS_ENUM.CHECKING,
            };
      case TASK_STATUS_ENUM.CHECKING:
        return isMe
          ? {
              label: 'Завершить',
              isDisabled: false,
              status: TASK_STATUS_ENUM.COMPLETED,
            }
          : { label: 'На проверке', isDisabled: true };

      default:
        return { label: 'Далее', isDisabled: true };
    }
  };

  const { label, isDisabled, status: newStatus } = getSaveButtonConditions();

  const isSaveEnabled =
    status !== TASK_STATUS_ENUM.COMPLETED &&
    status !== TASK_STATUS_ENUM.CANCELLED;
  const isRevisionEnabled =
    status === TASK_STATUS_ENUM.PENDING_APPROVAL ||
    (status === TASK_STATUS_ENUM.CHECKING && isMe);
  const isEditEnabled =
    (status === TASK_STATUS_ENUM.PREPARING && isMe) ||
    status === TASK_STATUS_ENUM.REVISION;

  useEffect(() => {
    if (Object.keys(errors).length) {
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: String(errors.description?.message),
        });
      }, 0);

      setTimeout(() => {
        clearErrors('description');
      }, 3000);
    }
  }, [clearErrors, errors]);

  return (
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
              disabled={isLoading || isDisabled}
              onClick={() => handleSubmitForm(newStatus)}
              endIcon={
                isDisabled && (
                  <CircularProgress
                    color="inherit"
                    size={16}
                  />
                )
              }
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
          onClick={() => handleEdit(false)}
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
              loading={isLoading}
              disabled={isLoading}
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

      <Snackbar
        open={snackbar?.open}
        autoHideDuration={3000}
        message={snackbar?.message}
        onClose={() => setSnackbar({ open: false, message: '' })}
      />
    </Stack>
  );
};
