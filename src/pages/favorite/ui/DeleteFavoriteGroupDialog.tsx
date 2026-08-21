import { Button, Stack, Typography } from '@mui/material';

import type { FavoriteGroup } from '@/entities/favorite';
import { AppDialog, appDialogActionsSx } from '@/shared';

type DeleteFavoriteGroupDialogProps = {
  group: FavoriteGroup | null;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const DeleteFavoriteGroupDialog = ({
  group,
  isPending = false,
  onClose,
  onConfirm,
}: DeleteFavoriteGroupDialogProps) => (
  <AppDialog
    open={Boolean(group)}
    onClose={onClose}
    title="Удалить подборку"
  >
    <Typography
      variant="body1"
      sx={{ mt: 2 }}
    >
      Подборка
      <Typography
        color="primary"
        sx={{ fontWeight: 500, display: 'inline-block', mx: 1 }}
      >
        {group?.name}
      </Typography>
      будет удалена. {group?.count} пост(ов) останутся в избранном без группы.
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
        onClick={onConfirm}
        disabled={isPending}
      >
        Удалить
      </Button>
    </Stack>
  </AppDialog>
);
