import { Button, Stack, Typography } from '@mui/material';
import { isAxiosError } from 'axios';

import {
  useDeleteMembershipMutation,
  type WorkspaceMember,
} from '@/entities/workspace-member';
import { AppDialog, appDialogActionsSx } from '@/shared';
import { useSnackbarStore } from '@/widgets';

type UnlinkProfileDialogProps = {
  profile: WorkspaceMember | null;
  onClose: () => void;
};

export const UnlinkProfileDialog = ({
  profile,
  onClose,
}: UnlinkProfileDialogProps) => {
  const { setSnackbarOpen } = useSnackbarStore();
  const { mutateAsync: unlinkProfile, isPending } =
    useDeleteMembershipMutation();

  const displayName = profile?.displayName || 'Профиль';
  const isOutgoing = profile?.canSwitch === false;

  const handleRemove = async () => {
    if (!profile?.membershipId) return;

    try {
      await unlinkProfile(profile.membershipId);
      setSnackbarOpen?.(true, 'Связь с профилем удалена');
      onClose();
    } catch (error) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : null;
      setSnackbarOpen?.(
        true,
        (typeof message === 'string' && message) ||
          'Не удалось удалить связь с профилем',
      );
    }
  };

  return (
    <AppDialog
      open={Boolean(profile)}
      onClose={onClose}
      title="Удалить связь"
      minWidth={400}
    >
      <Typography
        variant="body1"
        sx={{ mt: 2 }}
      >
        {isOutgoing ? (
          <>
            У профиля
            <Typography
              color="primary"
              sx={{ fontWeight: 500, display: 'inline-block', mx: 1 }}
            >
              {displayName}
            </Typography>
            пропадёт доступ к вашему рабочему пространству. Продолжить?
          </>
        ) : (
          <>
            Удалить
            <Typography
              color="primary"
              sx={{ fontWeight: 500, display: 'inline-block', mx: 1 }}
            >
              {displayName}
            </Typography>
            из связанных профилей? Вы потеряете доступ к этому профилю.
          </>
        )}
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
          onClick={() => void handleRemove()}
          disabled={isPending}
          loading={isPending}
        >
          Удалить
        </Button>
      </Stack>
    </AppDialog>
  );
};
