import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

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
}: WithdrawDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          maxWidth: '90%',
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
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: 4 }}>
        <Typography variant="h6">Отозвать отклик</Typography>

        <Typography
          variant="body1"
          sx={{ mt: 2 }}
        >
          Вы точно хотите отозвать отклик? Повторный отклик будет недоступен
        </Typography>

        <Stack
          direction="row"
          sx={{ mt: 4, justifyContent: 'flex-end', gap: 1 }}
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
      </Box>
    </Dialog>
  );
};
