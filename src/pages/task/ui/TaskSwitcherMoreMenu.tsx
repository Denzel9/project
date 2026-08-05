import { MoreVert } from '@mui/icons-material';
import { Divider, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  buildCreateTaskPayload,
  isTaskExecutor,
  isTaskOwner,
  TASK_STATUS_ENUM,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  type Task,
} from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { RequestCancelTaskDialog } from './RequestCancelTaskDialog';
import { RequestDeadlineExtensionDialog } from './RequestDeadlineExtensionDialog';
import { TaskTargetPostDialog } from './TaskTargetPostDialog';

type TaskTargetPostMode = 'duplicate';

type TaskSwitcherMoreMenuProps = {
  task?: Task | null;
  onTaskCreated?: (task: Task) => void;
};

export const TaskSwitcherMoreMenu = ({
  task,
  onTaskCreated,
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
  const { mutateAsync: updateTask, isPending: isUpdating } =
    useUpdateTaskMutation();

  const isOwner = Boolean(task && isTaskOwner(task, currentUserId));

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

  const showMenu =
    isOwner || canRequestAnnulment || canRequestDeadlineExtension;

  const currentPostId = task?.postId || task?.post?.id || null;

  const closeMenu = () => setMenuAnchor(null);

  const handleDuplicate = async () => {
    if (!task || !currentPostId) return;
    closeMenu();

    try {
      const created = await createTask(
        buildCreateTaskPayload(task, currentPostId)
      );
      setSnackbarOpen(true, 'Задача успешно дублирована');
      onTaskCreated?.(created);
    } catch {
      setSnackbarOpen(true, 'Не удалось дублировать задачу');
    }
  };

  const handleTargetPostConfirm = async (postId: string) => {
    if (!task || !targetPostMode) return;

    try {
      if (targetPostMode === 'duplicate') {
        const created = await createTask(buildCreateTaskPayload(task, postId));
        setSnackbarOpen(true, 'Задача успешно дублирована');
        setTargetPostMode(null);
        navigate(`${ROUTES.TASK}/${postId}?taskId=${created.id}`);
        return;
      }

      const updated = await updateTask({
        id: task.id,
        body: { postId },
      });
      setSnackbarOpen(true, 'Задача успешно перенесена');
      setTargetPostMode(null);
      navigate(
        `${ROUTES.TASK}/${updated.postId || postId}?taskId=${updated.id}`
      );
    } catch {
      setSnackbarOpen(
        true,
        targetPostMode === 'duplicate'
          ? 'Не удалось дублировать задачу'
          : 'Не удалось перенести задачу'
      );
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
        {isOwner && (
          <>
            <MenuItem
              disabled={isCreating}
              onClick={() => void handleDuplicate()}
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
        open={Boolean(targetPostMode)}
        mode={targetPostMode ?? 'duplicate'}
        excludePostId={currentPostId}
        isPending={isCreating || isUpdating}
        onClose={() => setTargetPostMode(null)}
        onConfirm={handleTargetPostConfirm}
      />
    </>
  );
};
