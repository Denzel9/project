export type FavoriteViewMode = 'grid' | 'table'

export type FavoriteTableReportControls = {
  disabled: boolean
  isExporting: boolean
  isPrinting?: boolean
  onPrint: () => void
  onExport: () => void
}

export type FavoritePostSortField =
  | 'title'
  | 'owner'
  | 'group'
  | 'savedAt'

export type FavoriteUserSortField =
  | 'name'
  | 'location'
  | 'followers'
  | 'completedTasksCount'
  | 'savedAt'

export type FavoriteSortOrder = 'asc' | 'desc'
