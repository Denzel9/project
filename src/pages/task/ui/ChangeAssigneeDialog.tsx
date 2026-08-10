import { Check, Close } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { useUpdateTaskMutation } from '@/entities';
import {
  MemberRole,
  MemberRoleLabels,
  useGetProfileMembersQuery,
} from '@/entities/workspace-member';
import { useSnackbarStore } from '@/widgets';

type ChangeAssigneeDialogProps = {
  open: boolean;
  taskId: string;
  currentAssigneeAccountId?: string | null;
  onClose: () => void;
};

type AssigneeOption = {
  id: string;
  label: string;
  roleLabel: string;
  membershipRole: MemberRole;
};

const getOptionPriority = (
  option: AssigneeOption,
  currentAssigneeAccountId?: string | null
) => {
  if (option.id === currentAssigneeAccountId) return 0;
  if (option.membershipRole === MemberRole.ADMIN) return 1;
  return 2;
};

export const ChangeAssigneeDialog = ({
  open,
  taskId,
  currentAssigneeAccountId,
  onClose,
}: ChangeAssigneeDialogProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  const { setSnackbarOpen } = useSnackbarStore();
  const { data: members, isLoading } = useGetProfileMembersQuery(open);
  const { mutateAsync: updateTask, isPending } = useUpdateTaskMutation();

  const options = useMemo(() => {
    const uniqueByLabel = new Map<string, AssigneeOption>();

    for (const member of members ?? []) {
      const option: AssigneeOption = {
        id: member.accountId,
        label: member.displayName || member.email || 'Участник',
        roleLabel: MemberRoleLabels[member.membershipRole],
        membershipRole: member.membershipRole,
      };
      const key = option.label.trim().toLocaleLowerCase('ru');
      const existing = uniqueByLabel.get(key);

      if (
        !existing ||
        getOptionPriority(option, currentAssigneeAccountId) <
        getOptionPriority(existing, currentAssigneeAccountId)
      ) {
        uniqueByLabel.set(key, option);
      }
    }

    return [...uniqueByLabel.values()].sort((a, b) =>
      a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' })
    );
  }, [members, currentAssigneeAccountId]);

  useEffect(() => {
    if (!open) return;

    setTimeout(() => {
      setSelectedAccountId(currentAssigneeAccountId ?? null);
    }, 0);
  }, [open, currentAssigneeAccountId]);

  const handleClose = () => {
    if (isPending) return;
    setSelectedAccountId(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedAccountId || selectedAccountId === currentAssigneeAccountId) {
      handleClose();
      return;
    }

    try {
      await updateTask({
        id: taskId,
        body: { assigneeAccountId: selectedAccountId },
      });
      setSnackbarOpen?.(true, 'Ответственный обновлён');
      handleClose();
    } catch {
      setSnackbarOpen?.(
        true,
        'Не удалось сменить ответственного. Попробуйте позже',
        'error'
      );
    }
  };

  const canSubmit =
    Boolean(selectedAccountId) &&
    selectedAccountId !== currentAssigneeAccountId &&
    !isPending;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          width: 480,
          maxWidth: '90%',
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        color="primary"
        disabled={isPending}
        sx={{
          top: 0,
          right: -60,
          position: 'absolute',
          bgcolor: 'secondary.main',
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Сменить ответственного</Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          Выберите участника профиля, который будет отвечать за задачу
        </Typography>

        <Box sx={{ mt: 3, maxHeight: 320, overflowY: 'auto' }}>
          {isLoading ? (
            <Stack
              sx={{ alignItems: 'center', py: 4 }}
            >
              <CircularProgress size={28} />
            </Stack>
          ) : options.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ py: 2 }}
            >
              Нет доступных участников
            </Typography>
          ) : (
            <List disablePadding>
              {options.map(option => {
                const isSelected = selectedAccountId === option.id;
                console.log(option);
                return (
                  <ListItemButton
                    key={option.id}
                    selected={isSelected}
                    onClick={() => setSelectedAccountId(option.id)}
                    sx={{ borderRadius: '16px', mb: 0.5 }}
                  >
                    <ListItemText
                      primary={option.label}
                      secondary={option.roleLabel}
                    />
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {isSelected ? <Check fontSize="small" /> : null}
                    </ListItemIcon>
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Box>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mt: 4, justifyContent: 'flex-end' }}
        >
          <Button
            onClick={handleClose}
            disabled={isPending}
          >
            Отменить
          </Button>
          <Button
            color="primary"
            variant="contained"
            loading={isPending}
            disabled={!canSubmit}
            onClick={() => void handleSubmit()}
          >
            Сохранить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
