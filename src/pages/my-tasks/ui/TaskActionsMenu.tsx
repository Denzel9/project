import { MoreVertOutlined } from '@mui/icons-material';
import { Box, Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import {
  buildCreateTaskPayload,
  isTaskExecutor,
  isTaskOwner,
  TASK_STATUS_ENUM,
  useConversationsQuery,
  useCreateTaskMutation,
  type Task,
} from '@/entities';
import { useAuthStore } from '@/features';
import { RequestCancelTaskDialog } from '@/pages/task/ui/RequestCancelTaskDialog';
import { RequestDeadlineExtensionDialog } from '@/pages/task/ui/RequestDeadlineExtensionDialog';
import { TaskTargetPostDialog } from '@/pages/task/ui/TaskTargetPostDialog';
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';
import { AddExecutorDialog } from '@/widgets/contact-card/ui/AddExecutorDialog';

type TaskTargetPostMode = 'duplicate' | 'duplicate-same';

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
  const [targetPostMode, setTargetPostMode] =
    useState<TaskTargetPostMode | null>(null);

  const { mutateAsync: createTask, isPending: isCopying } =
    useCreateTaskMutation();

  const isDialogOpen = Boolean(targetPostMode);

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
    task.status !== TASK_STATUS_ENUM.ANNULLED &&
    task.status !== TASK_STATUS_ENUM.COMPLETED &&
    task.executorId &&
    !pendingAnnulment &&
    (isOwner || isTaskExecutor(task, currentUserId))
  );

  const canRequestDeadlineExtension = Boolean(
    task &&
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

  const handleTargetPostConfirm = async ({
    postId,
    executorId,
  }: {
    postId: string;
    executorId: string | null;
  }) => {
    try {
      const created = await createTask(
        buildCreateTaskPayload(task, postId, executorId)
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
            sx={{ minWidth: 160 }}
            onClick={runMenuAction(handleAssign)}
          >
            Назначить
          </MenuItem>
        )}

        {showOwnerActions && (
          <MenuItem
            sx={{ minWidth: 160 }}
            disabled={isCopying}
            onClick={runMenuAction(() => {
              closeMenu();
              setTargetPostMode('duplicate-same');
            })}
          >
            Дублировать
          </MenuItem>
        )}

        {showOwnerActions && <Divider sx={{ my: 0.5 }} />}

        {showOwnerActions && (
          <MenuItem
            sx={{ minWidth: 160 }}
            disabled={isCopying}
            onClick={runMenuAction(() => {
              closeMenu();
              setTargetPostMode('duplicate');
            })}
          >
            Дублировать в другое объявление
          </MenuItem>
        )}

        {(canRequestAnnulment || canRequestDeadlineExtension) && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {canRequestAnnulment && (
          <MenuItem
            sx={{ minWidth: 160 }}
            onClick={runMenuAction(() => {
              closeMenu();
              setIsCancelDialogOpen(true);
            })}
          >
            <Typography>Запросить аннулирование</Typography>
          </MenuItem>
        )}

        {canRequestAnnulment && canRequestDeadlineExtension && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {canRequestDeadlineExtension && (
          <MenuItem
            sx={{ minWidth: 160 }}
            onClick={runMenuAction(() => {
              closeMenu();
              setIsDeadlineDialogOpen(true);
            })}
          >
            <Typography>Запросить перенос дедлайна</Typography>
          </MenuItem>
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
        mode={targetPostMode ?? 'duplicate'}
        fixedPostId={currentPostId}
        excludePostId={
          targetPostMode === 'duplicate' ? currentPostId : null
        }
        initialExecutorId={task.executorId}
        executorOptions={executorOptions}
        isPending={isCopying}
        onClose={() => setTargetPostMode(null)}
        onConfirm={handleTargetPostConfirm}
        onGoToCreatedTask={handleGoToCreatedTask}
      />
    </Box>
  );
};
