import type { SxProps, Theme } from '@mui/material'

export const FILTER_AUTOCOMPLETE_SLOT_PROPS = {
  paper: {
    sx: {
      mt: 0.5,
      borderRadius: '32px',
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
    },
  },
} as const

export const getTaskTableColumnCellSx = (
  width: string | number,
  compact = false,
): SxProps<Theme> => ({
  p: compact ? 1.5 : 3,
  width,
  maxWidth: width,
  overflow: 'hidden',
  boxSizing: 'border-box',
})

export const getTaskTableFilterCellSx = (
  width: string | number,
): SxProps<Theme> => ({
  ...getTaskTableColumnCellSx(width, true),
  top: 49,
  py: 1.25,
  zIndex: 3,
  verticalAlign: 'top',
  bgcolor: 'grey.50',
  borderBottom: '1px solid',
  borderColor: 'divider',
})
