export const ARCHIVE_POSTS_VIEW_MODE_KEY = 'archive-posts-view-mode';
export const ARCHIVE_TASKS_VIEW_MODE_KEY = 'archive-tasks-view-mode';

export const ARCHIVE_TABLE_PAGE_SIZE = 20;

export type ArchiveViewMode = 'grid' | 'table';

export type ArchiveTableReport = {
  disabled: boolean;
  isExporting: boolean;
  isPrinting: boolean;
  onPrint: () => void;
  onExport: () => void;
};

export const getInitialArchiveViewMode = (
  key: string,
): ArchiveViewMode => {
  if (typeof window === 'undefined') return 'grid';

  const stored = localStorage.getItem(key);

  return stored === 'table' ? 'table' : 'grid';
};
