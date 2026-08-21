import { Button, Stack, Typography } from '@mui/material';

import {
  useDeleteMembershipMutation,
  type ProfileMember,
} from '@/entities/workspace-member';
import { AppDialog, appDialogActionsSx } from '@/shared';

type DeleteMemberDialogProps = {
  member: ProfileMember | null;
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
      await removeMember(member.membershipId);
      onClose();
    } catch {
      console.log('Failed to remove member');
    }
  };

  return (
    <AppDialog
      open={Boolean(member)}
      onClose={onClose}
      title="Удалить участника"
      minWidth={400}
    >
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
        sx={appDialogActionsSx}
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
    </AppDialog>
  );
};
