import type { SxProps, Theme } from '@mui/material'

export const appDialogPaperSx = {
  m: { xs: 2, md: 0 },
  outline: 'none',
  position: 'relative',
  overflow: 'visible',
  borderRadius: '32px',
  width: { xs: 'calc(100% - 32px)', md: 'auto' },
  maxWidth: { xs: 'calc(100% - 32px)', md: '90vw' },
} as const satisfies SxProps<Theme>

export const appDialogCloseButtonSx = {
  top: { xs: 16, md: 0 },
  right: { xs: 16, md: -60 },
  position: 'absolute',
  zIndex: 1,
  bgcolor: 'secondary.main',
  ':hover': {
    bgcolor: 'secondary.light',
  },
} as const satisfies SxProps<Theme>

export const appDialogContentSx = {
  p: { xs: 3, md: 4 },
  overflow: 'hidden',
} as const satisfies SxProps<Theme>

export const appDialogActionsSx = {
  mt: 4,
  justifyContent: 'flex-end',
  gap: 1,
} as const satisfies SxProps<Theme>
