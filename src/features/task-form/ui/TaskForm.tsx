import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  TASK_STATUS_ENUM,
  type Task,
  type TaskActivity,
  type TaskStatus,
} from '@/entities/task';
import { useAuthStore } from '@/features';
import { ConfirmDialog, useSnackbarStore } from '@/widgets';

import { mapPostToForm, mapTaskToForm } from '../model/mappers';
import { hasUnsavedPostDefaults } from '../model/postDefaults';
import {
  defaultValues,
  schema,
  type TaskFormType,
} from '../model/schema/schema';

import { Action } from './action/Action';
import { TaskFormFields } from './TaskFormFields';

import type { Post } from '@/entities/post';

type TaskFormProps = {
  task: Task;
  post?: Post;
  isEdit: boolean;
  status: TaskStatus;
  isLoading: boolean;
  imagesLength: number;
  canChangeStatus?: boolean;
  activities: TaskActivity[];
  isExecutorApprove?: boolean;
  setIsEdit: (isEdit: boolean) => void;
  handleSimpleSaveForm: (values: TaskFormType) => void;
  onSubmit: (values: TaskFormType, status?: TaskStatus) => void;
};

export const TaskForm = ({
  task,
  post,
  isEdit,
  status,
  onSubmit,
  isLoading,
  setIsEdit,
  activities,
  imagesLength,
  isExecutorApprove,
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

  const { handleSubmit, getValues, reset } = methods;

  const editBaselineRef = useRef<TaskFormType | null>(null);

  const isOwner = task.ownerId === id;
  const showPrefillHint =
    Boolean(post) &&
    isOwner &&
    hasUnsavedPostDefaults(task, post!) &&
    [TASK_STATUS_ENUM.PREPARING, TASK_STATUS_ENUM.REVISION].includes(
      status as TASK_STATUS_ENUM
    );

  useEffect(() => {
    const formValues = mapTaskToForm(task);

    reset(formValues);
    editBaselineRef.current = null;
  }, [task, reset]);

  const beginEditSession = () => {
    if (!isEdit) {
      editBaselineRef.current = mapTaskToForm(task);
    }

    setIsEdit(true);
  };

  const handleApplyFromPost = () => {
    if (!post) return;

    if (!isEdit) {
      editBaselineRef.current = mapTaskToForm(task);
    }

    reset(mapPostToForm(post));
    setIsEdit(true);
  };

  const handleSave = () => {
    handleSimpleSaveForm(getValues());
    editBaselineRef.current = null;
    setIsEdit(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (editing: boolean) => {
    if (editing) {
      beginEditSession();
      return;
    }

    setIsEdit(editing);
  };

  const handleCancelEdit = () => {
    reset(editBaselineRef.current ?? mapTaskToForm(task));
    editBaselineRef.current = null;
    setIsEdit(false);
  };

  const handleGoToRevision = () => {
    onSubmit(getValues(), TASK_STATUS_ENUM.REVISION);
  };

  const handleCompleteTask = () => {
    onSubmit(getValues(), TASK_STATUS_ENUM.COMPLETED);
    setIsOpenConfirmDialog(false);
  };

  const handleSubmitForm = (newStatus?: TaskStatus) => {
    if (!imagesLength && status === TASK_STATUS_ENUM.IN_PROGRESS) {
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
          post={post}
          isMe={isOwner}
          status={status}
          isEdit={isEdit}
          onStartEdit={beginEditSession}
          showPrefillHint={showPrefillHint}
          onApplyFromPost={post ? handleApplyFromPost : undefined}
        />

        {canChangeStatus && (
          <Action
            taskId={task.id}
            status={status}
            isEdit={isEdit}
            isLoading={isLoading}
            activities={activities}
            handleEdit={handleEdit}
            handleCancel={handleCancelEdit}
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
