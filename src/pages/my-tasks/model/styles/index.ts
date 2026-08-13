export type TaskTableCellOptions = {
  first?: boolean
  actions?: boolean
}

type ThemeSpacing = {
  spacing: (value: number) => string
}

const withExtraPx = (value: string | number, extraPx: number) => {
  if (!extraPx) return value
  if (typeof value === 'number') {
    return (theme: ThemeSpacing) => `calc(${theme.spacing(value)} + ${extraPx}px)`
  }

  return `calc(${value} + ${extraPx}px)`
}

const firstColumnPl = (
  compactSidePadding: string | number,
  edgePadding: string | number | undefined,
  extraFirstPaddingPx: number,
) => withExtraPx(edgePadding ?? compactSidePadding, extraFirstPaddingPx)

export const filterCellSx = (
  width: string | number,
  edgePadding: string | number | undefined,
  isFilterRowOpen: boolean,
  headerRowHeight: number,
  options?: TaskTableCellOptions,
  extraFirstPaddingPx = 0,
) => ({
  width,
  maxWidth: width,
  overflow: 'hidden',
  boxSizing: 'border-box' as const,
  verticalAlign: 'top' as const,
  borderBottom: 'none',
  py: 0,
  pl: options?.first
    ? firstColumnPl(1.5, edgePadding, extraFirstPaddingPx)
    : 1.5,
  pr: options?.actions && edgePadding ? edgePadding : 1.5,
  ...(options?.actions && { minWidth: 72 }),
  ...(isFilterRowOpen
    ? {
        position: 'sticky' as const,
        top: headerRowHeight,
        zIndex: 3,
        bgcolor: 'grey.50',
      }
    : {
        position: 'static' as const,
        top: 'auto',
        zIndex: 'auto',
        bgcolor: 'transparent',
      }),
})

export const columnCellSx = (
  width: string | number,
  isSelfFetching: boolean,
  showColumnFilters: boolean,
  compactSidePadding: string | number,
  edgePadding: string | number | undefined,
  options?: TaskTableCellOptions,
  extraFirstPaddingPx = 0,
) => ({
  width,
  maxWidth: width,
  overflow: 'hidden',
  boxSizing: 'border-box' as const,
  py: isSelfFetching || showColumnFilters ? 2.75 : compactSidePadding,
  pl: options?.first
    ? firstColumnPl(compactSidePadding, edgePadding, extraFirstPaddingPx)
    : compactSidePadding,
  pr: options?.actions && edgePadding ? edgePadding : compactSidePadding,
  ...(options?.actions && {
    textAlign: 'right' as const,
    minWidth: 72,
  }),
})

export const headerCellSx = (
  width: string | number,
  isSelfFetching: boolean,
  showColumnFilters: boolean,
  compactSidePadding: string | number,
  edgePadding: string | number | undefined,
  options?: TaskTableCellOptions,
  extraFirstPaddingPx = 0,
) => ({
  ...columnCellSx(
    width,
    isSelfFetching,
    showColumnFilters,
    compactSidePadding,
    edgePadding,
    options,
    extraFirstPaddingPx,
  ),
  top: 0,
  zIndex: 4,
  bgcolor: 'background.paper',
})

export const filteredColumnLabelSx = {
  color: 'primary.main',
  fontWeight: 600,
  '&:hover, &:focus, &.Mui-active, &.Mui-active:hover': {
    color: 'primary.main',
  },
} as const
