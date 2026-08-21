import { Button, Stack, Typography } from '@mui/material';

import { AppDialog, appDialogActionsSx } from '@/shared';

type WithdrawDialogProps = {
  open: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export const WithdrawDialog = ({
  open,
  isPending = false,
  onClose,
  onConfirm,
}: WithdrawDialogProps) => (
  <AppDialog
    open={open}
    onClose={onClose}
    title="Отозвать отклик"
  >
    <Typography
      variant="body1"
      sx={{ mt: 2 }}
    >
      Вы точно хотите отозвать отклик? Повторный отклик будет недоступен
    </Typography>

    <Stack
      direction="row"
      sx={appDialogActionsSx}
    >
      <Button
        disabled={isPending}
        onClick={onClose}
      >
        Отменить
      </Button>
      <Button
        color="error"
        variant="contained"
        disabled={isPending}
        onClick={onConfirm}
      >
        Отозвать
      </Button>
    </Stack>
  </AppDialog>
);
