import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  TASK_STATUS_ENUM,
  type Task,
  type TaskActivity,
  type TaskStatus,
} from '@/entities/task';
import { useAuthStore } from '@/features';
import { ConfirmDialog, useSnackbarStore } from '@/widgets';

import { mapTaskToForm } from '../model/mappers';
import {
  defaultValues,
  schema,
  schemaKeys,
  type TaskFormType,
} from '../model/schema/schema';

import { Action } from './action/Action';
import { TaskFormFields } from './TaskFormFields';

type TaskFormProps = {
  task: Task;
  isEdit: boolean;
  status: TaskStatus;
  isLoading: boolean;
  imagesLength: number;
  canChangeStatus?: boolean;
  activities: TaskActivity[];
  isOpenDescription: boolean;
  isExecutorApprove?: boolean;
  setIsEdit: (isEdit: boolean) => void;
  setIsOpenDescription: (isOpen: boolean) => void;
  handleSimpleSaveForm: (values: TaskFormType) => void;
  onSubmit: (values: TaskFormType, status?: TaskStatus) => void;
};

export const TaskForm = ({
  task,
  isEdit,
  status,
  onSubmit,
  isLoading,
  setIsEdit,
  activities,
  imagesLength,
  isOpenDescription,
  isExecutorApprove,
  setIsOpenDescription,
  handleSimpleSaveForm,
  canChangeStatus = false,
}: TaskFormProps) => {
  const { id } = useAuthStore();

  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);

  const { setSnackbarOpen } = useSnackbarStore();

  const methods = useForm<TaskFormType>({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  const { handleSubmit, setValue, getValues } = methods;

  useEffect(() => {
    const formValues = mapTaskToForm(task);

    schemaKeys.forEach(key => {
      if (formValues[key] !== undefined) {
        setValue(key, formValues[key] as TaskFormType[typeof key]);
      }
    });
  }, [task, setValue]);

  const handleSave = () => {
    handleSimpleSaveForm(getValues());
    setIsEdit(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (isEdit: boolean) => {
    setIsEdit(isEdit);
    setIsOpenDescription(false);
  };

  const handleGoToRevision = () => {
    onSubmit(getValues(), TASK_STATUS_ENUM.REVISION);
  };

  const handleCompleteTask = () => {
    onSubmit(getValues(), TASK_STATUS_ENUM.COMPLETED);
    setIsOpenConfirmDialog(false);
  };

  const handleSubmitForm = (newStatus?: TaskStatus) => {
    if (!imagesLength) {
      setSnackbarOpen?.(
        true,
        'Для проверки необходимо загрузить результат работы'
      );
      return;
    }

    if (status === TASK_STATUS_ENUM.CHECKING) {
      setIsOpenConfirmDialog(true);
      return;
    }

    onSubmit(getValues(), newStatus);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(values =>
          status === TASK_STATUS_ENUM.CHECKING
            ? setIsOpenConfirmDialog(true)
            : onSubmit(values)
        )}
      >
        <TaskFormFields
          status={status}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          isMe={task.ownerId === id}
          isOpenDescription={isOpenDescription}
          setIsOpenDescription={setIsOpenDescription}
        />

        {canChangeStatus && (
          <Action
            taskId={task.id}
            status={status}
            isEdit={isEdit}
            isLoading={isLoading}
            activities={activities}
            handleEdit={handleEdit}
            handleSave={handleSave}
            taskOwnerId={task.ownerId}
            executorId={task.executor?.id}
            handleSubmitForm={handleSubmitForm}
            isExecutorApprove={isExecutorApprove}
            handleGoToRevision={handleGoToRevision}
            handleCompleteTask={handleCompleteTask}
          />
        )}

        <ConfirmDialog
          title="Завершить задачу"
          isOpen={isOpenConfirmDialog}
          onSuccess={handleCompleteTask}
          onClose={() => setIsOpenConfirmDialog(false)}
          description="Вы уверены, что хотите завершить задачу?"
        />
      </form>
    </FormProvider>
  );
};
