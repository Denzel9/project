export type TaskTableCellOptions = {
  first?: boolean
  actions?: boolean
}

export const filterCellSx = (
  width: string | number,
  edgePadding: string | number | undefined,
  isFilterRowOpen: boolean,
  headerRowHeight: number,
  options?: TaskTableCellOptions,
) => ({
  width,
  maxWidth: width,
  overflow: 'hidden',
  boxSizing: 'border-box' as const,
  verticalAlign: 'top' as const,
  borderBottom: 'none',
  py: 0,
  pl: options?.first && edgePadding ? edgePadding : 1.5,
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
) => ({
  width,
  maxWidth: width,
  overflow: 'hidden',
  boxSizing: 'border-box' as const,
  py: isSelfFetching || showColumnFilters ? 2.75 : compactSidePadding,
  pl: options?.first && edgePadding ? edgePadding : compactSidePadding,
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
) => ({
  ...columnCellSx(
    width,
    isSelfFetching,
    showColumnFilters,
    compactSidePadding,
    edgePadding,
    options,
  ),
  top: 0,
  zIndex: 4,
  bgcolor: 'background.paper',
})
