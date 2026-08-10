import { create } from 'zustand'

type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info'

type SnackbarStore = {
  message: string
  snackbarOpen: boolean
  severity: SnackbarSeverity
  actionLabel: string | null
  onAction: (() => void) | null
  autoHideDuration: number | null
  setSnackbarOpen: (
    snackbarOpen: boolean,
    message: string,
    severity?: SnackbarSeverity,
    options?: {
      actionLabel?: string | null
      onAction?: (() => void) | null
      autoHideDuration?: number | null
    },
  ) => void
}

export const useSnackbarStore = create<SnackbarStore>(set => ({
  message: '',
  snackbarOpen: false,
  severity: 'info',
  actionLabel: null,
  onAction: null,
  autoHideDuration: 3000,
  setSnackbarOpen: (snackbarOpen, message, severity = 'info', options) =>
    set({
      snackbarOpen,
      message,
      severity,
      actionLabel: options?.actionLabel ?? null,
      onAction: options?.onAction ?? null,
      autoHideDuration:
        options?.autoHideDuration === undefined
          ? 3000
          : options.autoHideDuration,
    }),
}))
