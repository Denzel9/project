import { MoreVert } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { USER_ROLE } from '@/entities';
import { useAuthStore, useRequireEmailConfirmed } from '@/features/auth';
import { getActionActorParts, ROUTES } from '@/shared';

import { ChangeAssigneeDialog } from './ChangeAssigneeDialog';

import type { Task } from '@/entities';

type TaskAssigneeCardProps = {
  taskId: string;
  ownerId: string;
  assigneeKind?: Task['assigneeKind'];
  assigneeAccountId?: Task['assigneeAccountId'];
  assigneeDisplayName?: Task['assigneeDisplayName'];
  assigneeUserId?: Task['assigneeUserId'];
};

export const TaskAssigneeCard = ({
  taskId,
  ownerId,
  assigneeKind,
  assigneeAccountId,
  assigneeDisplayName,
  assigneeUserId,
}: TaskAssigneeCardProps) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  const role = useAuthStore(state => state.role);
  const currentUserId = useAuthStore(state => state.id);
  const accountId = useAuthStore(state => state.accountId);

  const canAssignAssignee =
    role === USER_ROLE.COMPANY || role === USER_ROLE.MANAGER;

  const hasAssignee = Boolean(
    assigneeAccountId || assigneeDisplayName?.trim(),
  );

  const chatRecipientId =
    assigneeUserId ||
    (assigneeKind === 'OWNER' ? ownerId : null);

  const canWrite =
    hasAssignee &&
    Boolean(chatRecipientId) &&
    chatRecipientId !== currentUserId &&
    accountId !== assigneeAccountId;

  const assignee = getActionActorParts({
    actorDisplayName: assigneeDisplayName,
    actorKind: assigneeKind,
  });

  const initials = assignee?.name
    ? assignee.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('')
    : '?';

  const closeMenu = () => setMenuAnchor(null);

  const handleWrite = () => {
    if (!canWrite || !chatRecipientId) return;
    if (!requireEmailConfirmed()) return;

    navigate(`${ROUTES.CHATS}?recipientId=${chatRecipientId}`);
  };

  const openAssignDialog = () => {
    closeMenu();
    setIsDialogOpen(true);
  };

  return (
    <>
      <Box
        sx={{
          height: 'fit-content',
          bgcolor: 'white',
          borderRadius: '32px',
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mb: 2,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Chip
            size="small"
            label="Ответственный"
            sx={{
              fontWeight: 600,
              bgcolor: 'info.light',
              color: 'primary.main',
            }}
          />

          {canAssignAssignee && hasAssignee && (
            <IconButton
              size="small"
              aria-label="Действия ответственного"
              onClick={event => setMenuAnchor(event.currentTarget)}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          )}

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
          >
            <MenuItem onClick={openAssignDialog}>
              Сменить ответственного
            </MenuItem>
          </Menu>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: 'end' }}
        >
          {hasAssignee ? (
            <>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'end', textAlign: 'center' }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    fontSize: 18,
                    fontWeight: 700,
                    bgcolor:
                      assigneeKind === 'MANAGER'
                        ? 'primary.main'
                        : 'info.main',
                    color: 'common.white',
                  }}
                >
                  {initials}
                </Avatar>

                <Stack
                  direction="column"
                  spacing={0}
                  sx={{ justifyContent: 'start', alignItems: 'start' }}
                >
                  {assignee?.kindLabel && (
                    <Typography
                      color="info"
                      variant="caption"
                      sx={{ fontWeight: 600 }}
                    >
                      {assignee.kindLabel}
                    </Typography>
                  )}

                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {assignee?.name || 'Не назначен'}
                  </Typography>
                </Stack>
              </Stack>

              {canWrite && (
                <Button
                  size="small"
                  sx={{ px: 2 }}
                  variant="contained"
                  onClick={handleWrite}
                >
                  Написать
                </Button>
              )}
            </>
          ) : canAssignAssignee ? (
            <Button
              size="small"
              sx={{ px: 2 }}
              variant="contained"
              onClick={openAssignDialog}
            >
              Назначить ответственного
            </Button>
          ) : (
            <Typography variant="body2" color="info">
              Ответственный ещё не назначен
            </Typography>
          )}
        </Stack>
      </Box>

      <ChangeAssigneeDialog
        open={isDialogOpen}
        taskId={taskId}
        currentAssigneeAccountId={assigneeAccountId}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
};
