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

export type PublicationColumnFilter = {
  value: string
  options: { id: string; label: string }[]
  selectedOption?: { id: string; label: string } | null
  label: string
  placeholder?: string
  loading?: boolean
  minInputLength?: number
  onSearch?: (query: string) => void
  onChange: (id: string) => void
}

export type PublicationTableColumnFilters = {
  title: PublicationColumnFilter
  post: PublicationColumnFilter
  platform: PublicationColumnFilter
  executor: PublicationColumnFilter
  createdDate: string | null
  onCreatedDateChange: (value: string | null) => void
}
