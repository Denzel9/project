import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import {
  useDeleteMembershipMutation,
  type WorkspaceMember,
} from '@/entities/workspace-member';

type DeleteMemberDialogProps = {
  member: WorkspaceMember | null;
  onClose: () => void;
};

export const DeleteMemberDialog = ({
  member,
  onClose,
}: DeleteMemberDialogProps) => {
  const { mutateAsync: removeMember, isPending } =
    useDeleteMembershipMutation();

  const handleRemove = async () => {
    if (!member) return;

    try {
      await removeMember(member.id);
      onClose();
    } catch {
      console.log('Failed to remove member');
    }
  };

  return (
    <Dialog
      open={Boolean(member)}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        color="primary"
        sx={{
          top: 0,
          right: -60,
          position: 'absolute',
          bgcolor: 'secondary.main',
          ':hover': { bgcolor: 'secondary.light' },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Удалить участника</Typography>

        <Typography
          variant="body1"
          sx={{ mt: 2 }}
        >
          Удалить
          <Typography
            color="primary"
            sx={{ fontWeight: 500, display: 'inline-block', mx: 1 }}
          >
            {member?.displayName}
          </Typography>
          из команды?
        </Typography>

        <Stack
          direction="row"
          sx={{ mt: 4, justifyContent: 'flex-end', gap: 1 }}
        >
          <Button
            onClick={onClose}
            disabled={isPending}
          >
            Отменить
          </Button>

          <Button
            color="error"
            onClick={handleRemove}
            disabled={isPending}
          >
            Удалить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
