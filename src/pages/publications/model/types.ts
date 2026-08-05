export type PublicationViewMode = 'grid' | 'table'

export type PublicationTableReportControls = {
  disabled: boolean
  isExporting: boolean
  isPrinting?: boolean
  onPrint: () => void
  onExport: () => void
}

export type PublicationSortField =
  | 'title'
  | 'post'
  | 'platform'
  | 'executor'
  | 'createdAt'

export type PublicationSortOrder = 'asc' | 'desc'
