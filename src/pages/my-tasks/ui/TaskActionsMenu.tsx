import { MoreVertOutlined } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';

import {
  buildCreateTaskPayload,
  canEditTaskFields,
  TASK_STATUS_ENUM,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  type Task,
} from '@/entities';
import { useAuthStore } from '@/features';
import { ConfirmDialog, useSnackbarStore } from '@/widgets';
import { AddExecutorDialog } from '@/widgets/contact-card/ui/AddExecutorDialog';

type TaskActionsMenuProps = {
  task: Task;
  ownerOnly?: boolean;
  size?: 'small' | 'medium';
};

export const TaskActionsMenu = ({
  task,
  ownerOnly = false,
  size = 'medium',
}: TaskActionsMenuProps) => {
  const currentUserId = useAuthStore(state => state.id);
  const { setSnackbarOpen } = useSnackbarStore();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { mutateAsync: createTask, isPending: isCopying } =
    useCreateTaskMutation();
  const { mutateAsync: deleteTask } = useDeleteTaskMutation();

  const isOwner = canEditTaskFields(task, currentUserId);

  const canAssign = task.executorId == null && (ownerOnly || isOwner);
  const showOwnerActions = ownerOnly || isOwner;
  const canDelete =
    task.status === TASK_STATUS_ENUM.PREPARING ||
    task.status === TASK_STATUS_ENUM.PENDING_APPROVAL;

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

  const handleCopy = async () => {
    closeMenu();

    const postId = task.postId || task.post?.id;
    if (!postId) {
      setSnackbarOpen(true, 'Не удалось дублировать задачу');
      return;
    }

    try {
      await createTask(buildCreateTaskPayload(task, postId));
      setSnackbarOpen(true, 'Задача успешно дублирована');
    } catch {
      setSnackbarOpen(true, 'Не удалось дублировать задачу');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      setSnackbarOpen(true, 'Задача успешно удалена');
      setIsDeleteDialogOpen(false);
    } catch {
      setSnackbarOpen(true, 'Не удалось удалить задачу');
    }
  };

  const handleAssign = () => {
    closeMenu();
    setIsAssignDialogOpen(true);
  };

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
            onClick={runMenuAction(() => void handleCopy())}
          >
            Дублировать
          </MenuItem>
        )}

        {showOwnerActions && canDelete && (
          <MenuItem
            sx={{ minWidth: 160 }}
            onClick={runMenuAction(() => {
              closeMenu();
              setIsDeleteDialogOpen(true);
            })}
          >
            <Typography color="error">Удалить</Typography>
          </MenuItem>
        )}
      </Menu>

      <ConfirmDialog
        title="Удалить задачу"
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={() => void handleDelete()}
        description="Вы уверены, что хотите удалить задачу? Все данные будут удалены."
      />

      <AddExecutorDialog
        taskId={task.id}
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
      />
    </Box>
  );
};
