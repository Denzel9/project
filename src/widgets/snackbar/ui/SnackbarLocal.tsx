import { Alert, Button, Snackbar, useTheme } from '@mui/material'

import { getSnackbarAlertSx } from '../model/snackbarAlertStyles'
import { useSnackbarStore } from '../model/store'

export const SnackbarLocal = () => {
  const theme = useTheme()
  const {
    snackbarOpen,
    message,
    severity,
    setSnackbarOpen,
    actionLabel,
    onAction,
    autoHideDuration,
  } = useSnackbarStore()

  const handleClose = () => setSnackbarOpen(false, '')

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={autoHideDuration ?? undefined}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        severity={severity}
        variant="standard"
        onClose={handleClose}
        action={
          actionLabel && onAction ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                onAction()
                handleClose()
              }}
            >
              {actionLabel}
            </Button>
          ) : undefined
        }
        sx={getSnackbarAlertSx(severity, theme)}
      >
        {message}
      </Alert>
    </Snackbar>
  )
}
