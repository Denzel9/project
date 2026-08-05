export type MyPostViewMode = 'grid' | 'table'

export type ApplicationTableReportControls = {
  disabled: boolean
  isExporting: boolean
  isPrinting?: boolean
  onPrint: () => void
  onExport: () => void
}

export type ApplicationSortField =
  | 'applicant'
  | 'post'
  | 'status'
  | 'createdAt'
  | 'updatedAt'

export type ApplicationSortOrder = 'asc' | 'desc'
