import { MoreVertOutlined } from '@mui/icons-material';
import { Box, Divider, IconButton, Menu, MenuItem, } from '@mui/material';
import { useMemo, useState, type MouseEvent } from 'react';
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
import { RequestCancelTaskDialog } from '@/pages/task/ui/RequestCancelTaskDialog';
import { RequestDeadlineExtensionDialog } from '@/pages/task/ui/RequestDeadlineExtensionDialog';
import { TaskTargetPostDialog, type DuplicateTarget } from '@/pages/task/ui/TaskTargetPostDialog';
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';
import { AddExecutorDialog } from '@/widgets/contact-card/ui/AddExecutorDialog';

type TaskActionsMenuProps = {
  task: Task;
  ownerOnly?: boolean;
  size?: 'small' | 'medium';
};

const getExecutorLabel = (task: Task) => {
  if (!task.executor) return 'Исполнитель';

  return `${task.executor.name} ${task.executor.lastName}`.trim() || 'Исполнитель';
};

export const TaskActionsMenu = ({
  task,
  ownerOnly = false,
  size = 'medium',
}: TaskActionsMenuProps) => {
  const navigate = useNavigate();
  const currentUserId = useAuthStore(state => state.id);
  const { setSnackbarOpen } = useSnackbarStore();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);

  const { mutateAsync: createTask, isPending: isCopying } =
    useCreateTaskMutation();
  const { mutateAsync: updateTask, isPending: isUpdatingArchive } =
    useUpdateTaskMutation();
  const { mutateAsync: createTemplateFromTask, isPending: isSavingTemplate } =
    useCreateTaskTemplateFromTaskMutation();

  const isDialogOpen = isDuplicateOpen;

  const { data: conversations = [] } = useConversationsQuery(undefined, {
    enabled: isDialogOpen,
  });

  const isOwner = Boolean(task && isTaskOwner(task, currentUserId));
  const showOwnerActions = ownerOnly || isOwner;

  const canAssign = task.executorId == null && showOwnerActions;

  const pendingAnnulment =
    task?.annulment?.status === 'PENDING' ? task.annulment : null;

  const pendingDeadlineExtension =
    task?.deadlineExtension?.status === 'PENDING'
      ? task.deadlineExtension
      : null;

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

  const currentPostId = task.postId || task.post?.id || null;

  const executorOptions = useMemo(() => {
    const map = new Map<string, string>();

    if (task.executorId) {
      map.set(task.executorId, getExecutorLabel(task));
    }

    conversations.forEach(conversation => {
      map.set(conversation.peer.id, conversation.peer.displayName);
    });

    return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
  }, [conversations, task]);

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const stopMenuEvent = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
  };

  const runMenuAction =
    (action: () => void) => (event: MouseEvent<HTMLElement>) => {
      stopMenuEvent(event);
      action();
    };

  const openMenu = (event: MouseEvent<HTMLElement>) => {
    stopMenuEvent(event);
    setMenuAnchor(event.currentTarget);
  };

  const handleTargetPostConfirm = async (payload: DuplicateTarget) => {
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

  const handleGoToCreatedTask = (created: Task) => {
    const postId = created.postId || created.post?.id;
    if (!postId) return;
    navigate(`${ROUTES.TASK}/${postId}?taskId=${created.id}`);
  };

  const handleAssign = () => {
    closeMenu();
    setIsAssignDialogOpen(true);
  };

  const handleToggleArchive = async () => {
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
    closeMenu();

    try {
      await createTemplateFromTask(task.id);
      setSnackbarOpen(true, 'Задача сохранена как шаблон');
    } catch {
      setSnackbarOpen(true, 'Не удалось сохранить шаблон');
    }
  };

  const showMenu =
    canAssign ||
    showOwnerActions ||
    canRequestAnnulment ||
    canRequestDeadlineExtension;

  if (!showMenu) return null;

  return (
    <Box
      component="span"
      onClick={stopMenuEvent}
      onMouseDown={stopMenuEvent}
      sx={{ display: 'inline-flex' }}
    >
      <IconButton
        size={size}
        onClick={openMenu}
        onMouseDown={stopMenuEvent}
      >
        <MoreVertOutlined fontSize={size === 'small' ? 'small' : 'medium'} />
      </IconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        slotProps={{
          list: {
            onClick: stopMenuEvent,
            onMouseDown: stopMenuEvent,
          },
        }}
      >
        {canAssign && (
          <MenuItem
            sx={{ minWidth: 160, fontSize: 14 }}
            onClick={runMenuAction(handleAssign)}
          >
            Назначить
          </MenuItem>
        )}

        {showOwnerActions && (
          <MenuItem
            sx={{ minWidth: 160, fontSize: 14 }}
            disabled={isCopying}
            onClick={runMenuAction(() => {
              closeMenu();
              setIsDuplicateOpen(true);
            })}
          >
            Дублировать
          </MenuItem>
        )}

        {(canRequestAnnulment || canRequestDeadlineExtension) && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {canRequestAnnulment && (
          <MenuItem
            sx={{ minWidth: 160, fontSize: 14 }}
            onClick={runMenuAction(() => {
              closeMenu();
              setIsCancelDialogOpen(true);
            })}
          >
            Запросить аннулирование
          </MenuItem>
        )}

        {canRequestAnnulment && canRequestDeadlineExtension && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {canRequestDeadlineExtension && (
          <MenuItem
            sx={{ minWidth: 160, fontSize: 14 }}
            onClick={runMenuAction(() => {
              closeMenu();
              setIsDeadlineDialogOpen(true);
            })}
          >
            Запросить перенос дедлайна
          </MenuItem>
        )}

        {showOwnerActions && (
          <>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              sx={{ minWidth: 160, fontSize: 14 }}
              disabled={isSavingTemplate}
              onClick={runMenuAction(() => {
                void handleSaveAsTemplate();
              })}
            >
              Сохранить как шаблон
            </MenuItem>
            {(task.isArchived || canArchiveTask(task)) && (
              <>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  sx={{ minWidth: 160, fontSize: 14 }}
                  disabled={isUpdatingArchive}
                  onClick={runMenuAction(() => {
                    void handleToggleArchive();
                  })}
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

      <AddExecutorDialog
        taskId={task.id}
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
      />

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
        isPending={isCopying}
        onClose={() => setIsDuplicateOpen(false)}
        onConfirm={handleTargetPostConfirm}
        onGoToCreatedTask={handleGoToCreatedTask}
      />
    </Box>
  );
};
