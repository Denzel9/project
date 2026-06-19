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
  onClose?: () => void;
  onSuccess?: () => void;
  description?: string | React.ReactNode;
};

export const ConfirmDialog = ({
  title,
  isOpen,
  children,
  description,
  width = 600,
  onClose = undefined,
  onSuccess = undefined,
}: PropsWithChildren<ConfirmDialogProps>) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      sx={{
        minWidth: `${width}px`,
        maxHeight: '100vh',
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
          width: `${width}px`,
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

      <Box sx={{ p: 4, overflow: 'hidden' }}>
        <Typography variant="h6">{title}</Typography>

        <Box
          sx={{
            maxHeight: 'calc(100vh - 110px)',
            overflow: 'scroll',
          }}
        >
          {children}
        </Box>

        {!children && (
          <>
            {typeof description === 'string' ? (
              <Typography
                variant="body1"
                sx={{ mt: 2 }}
              >
                {description}
              </Typography>
            ) : (
              description
            )}

            {(onClose || onSuccess) && (
              <Stack
                direction="row"
                sx={{ mt: 4, justifyContent: 'flex-end' }}
              >
                {onClose && <Button onClick={onClose}>Отменить</Button>}
                {onSuccess && (
                  <Button
                    onClick={onSuccess}
                    color="error"
                  >
                    Подтвердить
                  </Button>
                )}
              </Stack>
            )}
          </>
        )}
      </Box>
    </Dialog>
  );
};
