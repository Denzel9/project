import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import type { FavoriteGroup } from '@/entities/favorite';

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
}: DeleteFavoriteGroupDialogProps) => {
  return (
    <Dialog
      open={Boolean(group)}
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
        <Typography variant="h6">Удалить подборку</Typography>

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
          будет удалена. {group?.count} пост(ов) останутся в избранном без
          группы.
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
            onClick={onConfirm}
            disabled={isPending}
          >
            Удалить
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};
