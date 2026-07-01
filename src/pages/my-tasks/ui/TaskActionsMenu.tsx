import { MoreVertOutlined } from '@mui/icons-material';
import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import {
  canEditTaskFields,
  useCreateTaskMutation,
  useDeleteTaskMutation,
  type Task,
} from '@/entities';
import { useAuthStore } from '@/features';
import { ROUTES } from '@/shared';
import { ConfirmDialog, useSnackbarStore } from '@/widgets';
import { AddExecutorDialog } from '@/widgets/contact-card/ui/AddExecutorDialog';

export const getTaskPath = (task: Task) =>
  `${ROUTES.TASK}/${task.id}?taskId=${task.id}&inviteId=${task.id}`;

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
  const navigate = useNavigate();
  const currentUserId = useAuthStore(state => state.id);
  const { setSnackbarOpen } = useSnackbarStore();

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { mutateAsync: createTask, isPending: isCopying } =
    useCreateTaskMutation();
  const { mutateAsync: deleteTask } = useDeleteTaskMutation();

  const isOwner = canEditTaskFields(task, currentUserId);

  if (ownerOnly && !isOwner) {
    return null;
  }

  const canAssign = task.executorId == null && (ownerOnly || isOwner);
  const showOwnerActions = ownerOnly || isOwner;

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

  const handleEdit = () => {
    closeMenu();
    navigate(getTaskPath(task));
  };

  const handleCopy = async () => {
    closeMenu();

    try {
      const copiedTask = await createTask({ postId: task.postId });
      setSnackbarOpen(true, 'Задача успешно скопирована');
      navigate(getTaskPath(copiedTask));
    } catch {
      setSnackbarOpen(true, 'Не удалось скопировать задачу');
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
        <MenuItem onClick={runMenuAction(handleEdit)}>Редактировать</MenuItem>

        {showOwnerActions && (
          <MenuItem
            disabled={isCopying}
            onClick={runMenuAction(() => void handleCopy())}
          >
            Копировать
          </MenuItem>
        )}

        {showOwnerActions && (
          <MenuItem
            onClick={runMenuAction(() => {
              closeMenu();
              setIsDeleteDialogOpen(true);
            })}
          >
            <Typography color="error">Удалить</Typography>
          </MenuItem>
        )}

        {canAssign && (
          <MenuItem onClick={runMenuAction(handleAssign)}>Назначить</MenuItem>
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
