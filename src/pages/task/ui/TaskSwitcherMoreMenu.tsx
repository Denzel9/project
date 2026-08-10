import { MoreVert } from '@mui/icons-material';
import { Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
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
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { RequestCancelTaskDialog } from './RequestCancelTaskDialog';
import { RequestDeadlineExtensionDialog } from './RequestDeadlineExtensionDialog';
import { TaskTargetPostDialog } from './TaskTargetPostDialog';

type TaskTargetPostMode = 'duplicate' | 'duplicate-same';

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
  const [targetPostMode, setTargetPostMode] =
    useState<TaskTargetPostMode | null>(null);

  const { mutateAsync: createTask, isPending: isCreating } =
    useCreateTaskMutation();

  const isOwner = Boolean(task && isTaskOwner(task, currentUserId));
  const isDialogOpen = Boolean(targetPostMode);

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
    setTargetPostMode(null);
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

  const handleTargetPostConfirm = async ({
    postId,
    executorId,
  }: {
    postId: string;
    executorId: string | null;
  }) => {
    if (!task || !targetPostMode) return;

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
            onClick={() => {
              closeMenu();
              onEdit?.();
            }}
          >
            <Typography>Редактировать</Typography>
          </MenuItem>
        )}

        {canEditTask && isOwner && <Divider sx={{ my: 0.5 }} />}

        {isOwner && (
          <>
            <MenuItem
              disabled={isCreating}
              onClick={() => {
                closeMenu();
                setTargetPostMode('duplicate-same');
              }}
            >
              <Typography>Дублировать</Typography>
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              onClick={() => {
                closeMenu();
                setTargetPostMode('duplicate');
              }}
            >
              <Typography>Дублировать в другой пост</Typography>
            </MenuItem>
          </>
        )}

        {isOwner && (canRequestAnnulment || canRequestDeadlineExtension) && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {canRequestAnnulment && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setIsCancelDialogOpen(true);
            }}
          >
            <Typography>Запросить аннулирование</Typography>
          </MenuItem>
        )}

        {canRequestAnnulment && canRequestDeadlineExtension && (
          <Divider sx={{ my: 0.5 }} />
        )}

        {canRequestDeadlineExtension && (
          <MenuItem
            onClick={() => {
              closeMenu();
              setIsDeadlineDialogOpen(true);
            }}
          >
            <Typography>Запросить перенос дедлайна</Typography>
          </MenuItem>
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
        mode={targetPostMode ?? 'duplicate'}
        fixedPostId={currentPostId}
        excludePostId={
          targetPostMode === 'duplicate' ? currentPostId : null
        }
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
