import type { SxProps, Theme } from '@mui/material'

/** CSS env() insets for PWA / iOS notch (viewport-fit=cover). */
export const SAFE_AREA = {
  top: 'env(safe-area-inset-top, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)',
} as const

/** Padding for page chrome so content clears the system status bar / home indicator. */
export const safeAreaPageSx = {
  pt: SAFE_AREA.top,
  pb: SAFE_AREA.bottom,
  pl: SAFE_AREA.left,
  pr: SAFE_AREA.right,
} as const satisfies SxProps<Theme>

/**
 * Sticky filter bar under the system safe area.
 * Use instead of `{ position: 'sticky', top: 0 }` on filter wrappers.
 */
export const stickyFilterSx = {
  position: 'sticky',
  top: SAFE_AREA.top,
  zIndex: 1000,
  // Закрывает полосу под status bar / Dynamic Island, когда бар «прилип»
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    height: SAFE_AREA.top,
    bgcolor: 'inherit',
    pointerEvents: 'none',
  },
} as const satisfies SxProps<Theme>
