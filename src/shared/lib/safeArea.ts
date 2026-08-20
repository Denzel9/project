import type { SxProps, Theme } from '@mui/material'

/** CSS env() insets for PWA / iOS notch (viewport-fit=cover). */
export const SAFE_AREA = {
  top: 'var(--safe-area-inset-top, env(safe-area-inset-top, 0px))',
  right: 'var(--safe-area-inset-right, env(safe-area-inset-right, 0px))',
  bottom: 'var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px))',
  left: 'var(--safe-area-inset-left, env(safe-area-inset-left, 0px))',
} as const

const spacingPx = (units: number) => `${units * 8}px`

const withInset = (units: number, inset: string) =>
  `calc(${spacingPx(units)} + ${inset})`

/** Padding for page chrome so content clears the system status bar / home indicator. */
export const safeAreaPageSx = {
  pt: SAFE_AREA.top,
  pb: SAFE_AREA.bottom,
  pl: SAFE_AREA.left,
  pr: SAFE_AREA.right,
} as const satisfies SxProps<Theme>

type ResponsiveDrawerPadding = {
  xs: string
  sm: number
  md?: number
}

export type DrawerSafeAreaPadding = {
  boxSizing: 'border-box'
  pt: string | ResponsiveDrawerPadding
  pb: string | ResponsiveDrawerPadding
  pl: string | ResponsiveDrawerPadding
  pr: string | ResponsiveDrawerPadding
}

/**
 * Paper padding for drawers that are full viewport width on mobile.
 * Applies safe-area insets on `xs`; from `sm` up uses plain spacing (partial width).
 */
export const safeAreaFullWidthDrawerPaperSx = (options?: {
  xs?: number
  sm?: number
  md?: number
}): DrawerSafeAreaPadding => {
  const xs = options?.xs ?? 2
  const sm = options?.sm ?? 3
  const md = options?.md

  const side = (inset: string): ResponsiveDrawerPadding => ({
    xs: withInset(xs, inset),
    sm,
    ...(md !== undefined ? { md } : {}),
  })

  return {
    boxSizing: 'border-box',
    pt: side(SAFE_AREA.top),
    pb: side(SAFE_AREA.bottom),
    pl: side(SAFE_AREA.left),
    pr: side(SAFE_AREA.right),
  }
}

/**
 * Paper padding when drawer width is toggled via `isMobile` (100% vs fixed).
 * Only adds safe-area insets while the drawer is full-width.
 */
export const safeAreaMobileFullWidthDrawerPadding = (
  isMobile: boolean,
  spacing = 2,
): DrawerSafeAreaPadding | Record<string, never> =>
  isMobile
    ? {
        boxSizing: 'border-box',
        pt: withInset(spacing, SAFE_AREA.top),
        pb: withInset(spacing, SAFE_AREA.bottom),
        pl: withInset(spacing, SAFE_AREA.left),
        pr: withInset(spacing, SAFE_AREA.right),
      }
    : {}

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
    bgcolor: 'background.paper',
    pointerEvents: 'none',
  },
} as const satisfies SxProps<Theme>
