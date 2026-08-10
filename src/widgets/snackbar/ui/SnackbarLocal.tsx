import { Button, Snackbar } from '@mui/material'

import { useSnackbarStore } from '../model/store'

export const SnackbarLocal = () => {
  const {
    snackbarOpen,
    message,
    setSnackbarOpen,
    actionLabel,
    onAction,
    autoHideDuration,
  } = useSnackbarStore()

  return (
    <Snackbar
      message={message}
      open={snackbarOpen}
      autoHideDuration={autoHideDuration ?? undefined}
      onClose={() => setSnackbarOpen(false, '')}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      action={
        actionLabel && onAction ? (
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              onAction()
              setSnackbarOpen(false, '')
            }}
          >
            {actionLabel}
          </Button>
        ) : undefined
      }
    />
  )
}
