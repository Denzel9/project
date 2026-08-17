import { yupResolver } from '@hookform/resolvers/yup';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react';
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
  isExecutorApprove?: boolean | null;
  setIsEdit: (isEdit: boolean) => void;
  handleSimpleSaveForm: (values: TaskFormType) => Promise<boolean>;
  onSubmit: (values: TaskFormType, status?: TaskStatus) => Promise<boolean>;
  onCancelEdit?: () => void;
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
  onCancelEdit,
}: TaskFormProps) => {
  const { id } = useAuthStore();

  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [isCompletingTask, setIsCompletingTask] = useState(false);

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

  const handleCancelEdit = useCallback(() => {
    reset(editBaselineRef.current ?? mapTaskToForm(task));
    editBaselineRef.current = null;
    onCancelEdit?.();
    setIsEdit(false);
  }, [onCancelEdit, reset, setIsEdit, task]);

  const handleSave = async () => {
    setIsSavingForm(true);

    try {
      const isSaved = await handleSimpleSaveForm(getValues());

      if (!isSaved) return;

      setSnackbarOpen?.(true, 'Данные успешно сохранены', 'success');
      editBaselineRef.current = null;
      setIsEdit(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSavingForm(false);
    }
  };

  const handleEdit = (editing: boolean) => {
    if (editing) {
      beginEditSession();
      return;
    }

    setIsEdit(editing);
  };

  const handleGoToRevision = async () => {
    await onSubmit(getValues(), TASK_STATUS_ENUM.REVISION);
  };

  const handleCompleteTask = async () => {
    setIsCompletingTask(true);

    try {
      const isSaved = await onSubmit(getValues(), TASK_STATUS_ENUM.COMPLETED);

      if (!isSaved) return;

      setIsOpenConfirmDialog(false);
    } finally {
      setIsCompletingTask(false);
    }
  };

  const handleSubmitForm = async (newStatus?: TaskStatus) => {
    if (!imagesLength && status === TASK_STATUS_ENUM.IN_PROGRESS) {
      setSnackbarOpen?.(
        true,
        'Для проверки необходимо загрузить результат работы',
        'warning'
      );
      return;
    }

    if (status === TASK_STATUS_ENUM.CHECKING) {
      setIsOpenConfirmDialog(true);
      return;
    }

    await onSubmit(getValues(), newStatus);
  };

  const onFormValid = useCallback(
    async (values: TaskFormType) => {
      if (status === TASK_STATUS_ENUM.CHECKING) {
        setIsOpenConfirmDialog(true);
        return;
      }

      await onSubmit(values);
    },
    [onSubmit, status]
  );

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit(onFormValid)(event);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleFormSubmit}>
        <TaskFormFields
          post={post}
          isMe={isOwner}
          status={status}
          isEdit={isEdit}
          onStartEdit={beginEditSession}
          showPrefillHint={showPrefillHint}
          withExecutor={Boolean(task.executorId)}
          onApplyFromPost={post ? handleApplyFromPost : undefined}
        />

        {canChangeStatus && (
          <Action
            taskId={task.id}
            status={status}
            isEdit={isEdit}
            isLoading={isLoading}
            isSaving={isSavingForm || isLoading}
            activities={activities}
            handleEdit={handleEdit}
            handleSave={handleSave}
            taskOwnerId={task.ownerId}
            executorId={task.executor?.id}
            handleCancel={handleCancelEdit}
            handleSubmitForm={handleSubmitForm}
            isExecutorApprove={isExecutorApprove}
            isCompanyAction={task.isCompanyAction}
            handleGoToRevision={handleGoToRevision}
            handleCompleteTask={handleCompleteTask}
          />
        )}

        <ConfirmDialog
          title="Завершить задачу"
          isOpen={isOpenConfirmDialog}
          isPending={isCompletingTask}
          onSuccess={handleCompleteTask}
          onClose={() => setIsOpenConfirmDialog(false)}
          description="Вы уверены, что хотите завершить задачу?"
        />
      </form>
    </FormProvider>
  );
};
