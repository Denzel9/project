import { alpha, type Theme } from '@mui/material'

import type { SnackbarSeverity } from './store'

type SeverityStyle = {
  bgcolor: string
  borderColor: string
  iconColor: string
  textColor: string
}

const getSeverityStyle = (
  severity: SnackbarSeverity,
  theme: Theme,
): SeverityStyle => {
  const isDark = theme.palette.mode === 'dark'
  const textColor = theme.palette.text.primary

  const soft = (color: string, bgAlpha: number, borderAlpha: number) => ({
    bgcolor: alpha(color, isDark ? bgAlpha + 0.04 : bgAlpha),
    borderColor: alpha(color, isDark ? borderAlpha : borderAlpha - 0.04),
    iconColor: alpha(color, isDark ? 0.92 : 0.88),
    textColor,
  })

  switch (severity) {
    case 'success':
      return soft(theme.palette.success.main, 0.1, 0.26)
    case 'error':
      return soft(theme.palette.error.main, 0.1, 0.26)
    case 'warning':
      return soft(theme.palette.warning.main, 0.12, 0.28)
    case 'info':
    default:
      return soft(theme.palette.primary.main, 0.08, 0.22)
  }
}

export const getSnackbarAlertSx = (
  severity: SnackbarSeverity,
  theme: Theme,
) => {
  const style = getSeverityStyle(severity, theme)
  const isDark = theme.palette.mode === 'dark'

  return {
    width: '100%',
    borderRadius: '14px',
    bgcolor: style.bgcolor,
    color: style.textColor,
    border: `1px solid ${style.borderColor}`,
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, isDark ? 0.22 : 0.08)}`,
    alignItems: 'center',
    py: 0.25,
    '& .MuiAlert-icon': {
      color: style.iconColor,
      opacity: 0.95,
    },
    '& .MuiAlert-action .MuiButton-root': {
      color: style.iconColor,
    },
    '& .MuiAlert-action .MuiIconButton-root': {
      color: alpha(style.iconColor, 0.85),
    },
  }
}
