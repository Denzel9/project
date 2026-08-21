import { Box, Button, Stack, Typography } from '@mui/material';

import { AppDialog, appDialogActionsSx } from '@/shared';

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
  const handleClose = onClose ?? (() => undefined);

  return (
    <AppDialog
      open={isOpen}
      onClose={handleClose}
      title={title}
      width={width}
      hideCloseButton={!onClose}
    >
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
          sx={appDialogActionsSx}
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
    </AppDialog>
  );
};
