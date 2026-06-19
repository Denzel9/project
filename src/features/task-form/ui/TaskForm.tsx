import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  TASK_STATUS_ENUM,
  type Task,
  type TaskActivity,
  type TaskStatus,
} from '@/entities/task';
import { ConfirmDialog } from '@/widgets';

import { mapTaskToForm } from '../model/mappers';
import {
  defaultValues,
  schema,
  schemaKeys,
  type TaskFormType,
} from '../model/schema/schema';

import { Action } from './Action';
import { TaskFormFields } from './TaskFormFields';

type TaskFormProps = {
  task: Task;
  isEdit: boolean;
  status: TaskStatus;
  isLoading: boolean;
  canChangeStatus?: boolean;
  activities: TaskActivity[];
  isOpenDescription: boolean;
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
  isOpenDescription,
  setIsOpenDescription,
  handleSimpleSaveForm,
  canChangeStatus = false,
}: TaskFormProps) => {
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);

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
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          isOpenDescription={isOpenDescription}
          setIsOpenDescription={setIsOpenDescription}
        />

        {canChangeStatus && (
          <Action
            status={status}
            isEdit={isEdit}
            isLoading={isLoading}
            activities={activities}
            handleEdit={handleEdit}
            handleSave={handleSave}
            taskOwnerId={task.ownerId}
            handleSubmitForm={handleSubmitForm}
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
