import { MoreVert } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { USER_ROLE } from '@/entities';
import { MemberRole } from '@/entities/workspace-member';
import { useAuthStore } from '@/features';
import { getActionActorParts } from '@/shared';

import { ChangeAssigneeDialog } from './ChangeAssigneeDialog';

import type { Task } from '@/entities';

type TaskAssigneeCardProps = {
  taskId: string;
  assigneeKind?: Task['assigneeKind'];
  assigneeAccountId?: Task['assigneeAccountId'];
  assigneeDisplayName?: Task['assigneeDisplayName'];
};

export const TaskAssigneeCard = ({
  taskId,
  assigneeKind,
  assigneeAccountId,
  assigneeDisplayName,
}: TaskAssigneeCardProps) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const role = useAuthStore(state => state.role);
  const membershipRole = useAuthStore(state => state.membershipRole);

  const canChangeAssignee =
    role === USER_ROLE.COMPANY &&
    (membershipRole === MemberRole.OWNER ||
      membershipRole === MemberRole.ADMIN);

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

          {canChangeAssignee && (
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
            <MenuItem
              onClick={() => {
                closeMenu();
                setIsDialogOpen(true);
              }}
            >
              Сменить ответственного
            </MenuItem>
          </Menu>
        </Stack>

        <Stack
          sx={{ alignItems: 'center', textAlign: 'center' }}
        >
          <Avatar
            sx={{
              mb: 2,
              width: 56,
              height: 56,
              fontSize: 18,
              fontWeight: 700,
              bgcolor:
                assigneeKind === 'MANAGER' ? 'primary.main' : 'info.main',
              color: 'common.white',
            }}
          >
            {initials}
          </Avatar>

          {assignee?.kindLabel && (
            <Typography
              color="info"
              variant="caption"
              sx={{ fontWeight: 600 }}
            >
              {assignee.kindLabel}
            </Typography>
          )}

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600 }}
          >
            {assignee?.name || 'Не назначен'}
          </Typography>
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
