import { MoreVert } from '@mui/icons-material';
import { Divider, IconButton, Menu, MenuItem, } from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  buildCreateTaskPayload,
  canArchiveTask,
  isTaskExecutor,
  isTaskOwner,
  TASK_STATUS_ENUM,
  useConversationsQuery,
  useCreateTaskMutation,
  useCreateTaskTemplateFromTaskMutation,
  useUpdateTaskMutation,
  type Task,
} from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { RequestCancelTaskDialog } from './RequestCancelTaskDialog';
import { RequestDeadlineExtensionDialog } from './RequestDeadlineExtensionDialog';
import { TaskTargetPostDialog, type DuplicateTarget } from './TaskTargetPostDialog';

type TaskSwitcherMoreMenuProps = {
  task?: Task | null;
  onTaskCreated?: (task: Task) => void;
  onEdit?: () => void;
};

const getExecutorLabel = (task: Task) => {
  if (!task.executor) return 'Исполнитель';

  return `${task.executor.name} ${task.executor.lastName}`.trim() || 'Исполнитель';
};

export const TaskSwitcherMoreMenu = ({
  task,
  onTaskCreated,
  onEdit,
}: TaskSwitcherMoreMenuProps) => {
  const navigate = useNavigate();
  const currentUserId = useAuthStore(state => state.id);
  const { setSnackbarOpen } = useSnackbarStore();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);

  const { mutateAsync: createTask, isPending: isCreating } =
    useCreateTaskMutation();
  const { mutateAsync: updateTask, isPending: isUpdatingArchive } =
    useUpdateTaskMutation();
  const { mutateAsync: createTemplateFromTask, isPending: isSavingTemplate } =
    useCreateTaskTemplateFromTaskMutation();

  const isOwner = Boolean(task && isTaskOwner(task, currentUserId));
  const isDialogOpen = isDuplicateOpen;

  const { data: conversations = [] } = useConversationsQuery(undefined, {
    enabled: isDialogOpen,
  });

  const pendingAnnulment =
    task?.annulment?.status === 'PENDING' ? task.annulment : null;

  const pendingDeadlineExtension =
    task?.deadlineExtension?.status === 'PENDING'
      ? task.deadlineExtension
      : null;

  const canEditTask = Boolean(
    task &&
    isOwner &&
    onEdit &&
    (task.status === TASK_STATUS_ENUM.PREPARING ||
      task.status === TASK_STATUS_ENUM.REVISION)
  );

  const canRequestAnnulment = Boolean(
    task &&
    !task.isArchived &&
    task.status !== TASK_STATUS_ENUM.ANNULLED &&
    task.status !== TASK_STATUS_ENUM.COMPLETED &&
    task.executorId &&
    !pendingAnnulment &&
    (isOwner || isTaskExecutor(task, currentUserId))
  );

  const canRequestDeadlineExtension = Boolean(
    task &&
    !task.isArchived &&
    task.status !== TASK_STATUS_ENUM.ANNULLED &&
    task.status !== TASK_STATUS_ENUM.COMPLETED &&
    task.executorId &&
    !pendingDeadlineExtension &&
    (isOwner || isTaskExecutor(task, currentUserId))
  );

  const showMenu =
    isOwner ||
    canEditTask ||
    canRequestAnnulment ||
    canRequestDeadlineExtension;

  const currentPostId = task?.postId || task?.post?.id || null;

  const executorOptions = useMemo(() => {
    const map = new Map<string, string>();

    if (task?.executorId) {
      map.set(task.executorId, getExecutorLabel(task));
    }

    conversations.forEach(conversation => {
      map.set(conversation.peer.id, conversation.peer.displayName);
    });

    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [conversations, task]);

  const closeMenu = () => setMenuAnchor(null);

  const handleCloseTargetDialog = () => {
    setIsDuplicateOpen(false);
  };

  const handleGoToCreatedTask = (created: Task) => {
    const postId = created.postId || created.post?.id;
    const isSamePost = Boolean(postId && postId === currentPostId);

    if (isSamePost && onTaskCreated) {
      onTaskCreated(created);
      return;
    }

    if (postId) {
      navigate(`${ROUTES.TASK}/${postId}?taskId=${created.id}`);
    }
  };

  const handleTargetPostConfirm = async (payload: DuplicateTarget) => {
    if (!task) return;

    const postId =
      payload.target === 'current' ? currentPostId : payload.postId;

    if (!postId) {
      setSnackbarOpen(true, 'Не удалось дублировать задачу');
      throw new Error('Нет объявления');
    }

    try {
      const created = await createTask(
        buildCreateTaskPayload(task, postId, payload.executorId)
      );

      return created;
    } catch (error) {
      setSnackbarOpen(true, 'Не удалось дублировать задачу');
      throw error;
    }
  };

  const handleToggleArchive = async () => {
    if (!task) return;
    closeMenu();
    const nextArchived = !task.isArchived;

    if (nextArchived && !canArchiveTask(task)) {
      setSnackbarOpen(
        true,
        'В архив можно переместить только завершённую, аннулированную задачу или задачу на стадии подготовки, пока исполнитель не подтвердил участие',
      );
      return;
    }

    try {
      await updateTask({
        id: task.id,
        body: { isArchived: nextArchived },
      });
      setSnackbarOpen(
        true,
        nextArchived
          ? 'Задача перемещена в архив'
          : 'Задача возвращена из архива',
      );
    } catch {
      setSnackbarOpen(
        true,
        nextArchived
          ? 'Не удалось переместить задачу в архив'
          : 'Не удалось вернуть задачу из архива',
      );
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!task) return;
    closeMenu();

    try {
      await createTemplateFromTask(task.id);
      setSnackbarOpen(true, 'Задача сохранена как шаблон');
    } catch {
      setSnackbarOpen(true, 'Не удалось сохранить шаблон');
    }
  };

  if (!showMenu || !task) {
    return null;
  }

  return (
    <>
      <IconButton
        size="small"
        aria-label="Дополнительные действия"
        onClick={event => setMenuAnchor(event.currentTarget)}
      >
        <MoreVert />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        {canEditTask && (
          <MenuItem
            sx={{ fontSize: 14 }}
            onClick={() => {
              closeMenu();
              onEdit?.();
            }}
          >
            Редактировать
          </MenuItem>
        )}

        {canEditTask && isOwner && <Divider sx={{ my: 0.5 }} />}

        {isOwner && (
          <MenuItem
            sx={{ fontSize: 14 }}
            disabled={isCreating}
            onClick={() => {
              closeMenu();
              setIsDuplicateOpen(true);
            }}
          >
            Дублировать
          </MenuItem>
        )}

        {isOwner && (canRequestAnnulment || canRequestDeadlineExtension) && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {canRequestAnnulment && (
          <MenuItem
            sx={{ fontSize: 14 }}
            onClick={() => {
              closeMenu();
              setIsCancelDialogOpen(true);
            }}
          >
            Запросить аннулирование
          </MenuItem>
        )}

        {canRequestAnnulment && canRequestDeadlineExtension && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {canRequestDeadlineExtension && (
          <MenuItem
            sx={{ fontSize: 14 }}
            onClick={() => {
              closeMenu();
              setIsDeadlineDialogOpen(true);
            }}
          >
            Запросить перенос дедлайна
          </MenuItem>
        )}

        {isOwner && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              sx={{ fontSize: 14 }}
              disabled={isSavingTemplate}
              onClick={() => {
                void handleSaveAsTemplate();
              }}
            >
              Сохранить как шаблон
            </MenuItem>
            {(task.isArchived || canArchiveTask(task)) && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  sx={{ fontSize: 14 }}
                  disabled={isUpdatingArchive}
                  onClick={() => {
                    void handleToggleArchive();
                  }}
                >
                  {task.isArchived
                    ? 'Вернуть из архива'
                    : 'Переместить в архив'}
                </MenuItem>
              </>
            )}
          </>
        )}
      </Menu>

      <RequestCancelTaskDialog
        open={isCancelDialogOpen && Boolean(task.id)}
        taskId={task.id}
        onClose={() => setIsCancelDialogOpen(false)}
      />

      <RequestDeadlineExtensionDialog
        open={isDeadlineDialogOpen && Boolean(task.id)}
        taskId={task.id}
        currentFinalDate={task.finalDate}
        onClose={() => setIsDeadlineDialogOpen(false)}
      />

      <TaskTargetPostDialog
        open={isDialogOpen}
        currentPostId={currentPostId}
        currentPostTitle={task.post?.title}
        initialExecutorId={task.executorId}
        executorOptions={executorOptions}
        isPending={isCreating}
        onClose={handleCloseTargetDialog}
        onConfirm={handleTargetPostConfirm}
        onGoToCreatedTask={handleGoToCreatedTask}
      />
    </>
  );
};
