import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { isAxiosError } from 'axios';

import {
  useDeleteMembershipMutation,
  type WorkspaceMember,
} from '@/entities/workspace-member';
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
    <Dialog
      open={Boolean(profile)}
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
        <Typography variant="h6">Удалить связь</Typography>

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
            onClick={() => void handleRemove()}
            disabled={isPending}
            loading={isPending}
          >
            Удалить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
