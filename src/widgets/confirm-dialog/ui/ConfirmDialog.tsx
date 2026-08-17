import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import type { PropsWithChildren } from 'react';

type ConfirmDialogProps = {
  title?: string;
  width?: number;
  isOpen: boolean;
  isPending?: boolean;
  onClose?: () => void;
  withButtons?: boolean;
  onSuccess?: () => void;
  successLabel?: string;
  successColor?: 'error' | 'primary';
  description?: string | React.ReactNode;
};

export const ConfirmDialog = ({
  title,
  isOpen,
  children,
  description,
  width = 600,
  isPending = false,
  withButtons = true,
  onClose = undefined,
  onSuccess = undefined,
  successLabel = 'Подтвердить',
  successColor = 'error',
}: PropsWithChildren<ConfirmDialogProps>) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            m: 0,
            outline: 'none',
            position: 'relative',
            overflow: 'visible',
            borderRadius: '24px',
            width: {
              xs: '100%',
              md: `${width}px`,
            },
            maxWidth: {
              xs: '100%',
              md: `${width}px`,
            },
          },
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
          display: { xs: 'none', md: 'inline-flex' },
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Box sx={{ p: { xs: 3, md: 4 }, overflow: 'hidden' }}>
        <Typography variant="h6">{title}</Typography>

        <Box
          sx={{
            maxHeight: 'calc(100vh - 110px)',
            overflow: 'auto',
          }}
        >
          {children}
        </Box>

        {!children && typeof description === 'string' ? (
          <Typography
            variant="body1"
            sx={{ mt: 2, wordBreak: 'break-word' }}
          >
            {description}
          </Typography>
        ) : (
          description
        )}

        {withButtons && (onClose || onSuccess) && (
          <Stack
            direction="row"
            spacing={1}
            sx={{ mt: 4, justifyContent: 'flex-end' }}
          >
            {onClose && (
              <Button
                onClick={onClose}
                disabled={isPending}
              >
                Отменить
              </Button>
            )}
            {onSuccess && (
              <Button
                onClick={onSuccess}
                color={successColor}
                loading={isPending}
                disabled={isPending}
              >
                {successLabel}
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Dialog>
  );
};
