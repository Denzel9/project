export type MyResponseViewMode = 'grid' | 'table'

export type MyResponseTableReportControls = {
  disabled: boolean
  isExporting: boolean
  isPrinting?: boolean
  onPrint: () => void
  onExport: () => void
}

export type MyResponseSortField =
  | 'post'
  | 'company'
  | 'status'
  | 'createdAt'
  | 'updatedAt'

export type MyResponseSortOrder = 'asc' | 'desc'
