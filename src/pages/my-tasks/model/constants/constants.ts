export const TASK_TABLE_PAGE_SIZE = 20;
export const KANBAN_COLUMN_PAGE_SIZE = 20;

export const TASK_TABLE_COLUMN_WIDTHS = {
  title: '20%',
  status: '10%',
  customer: '15%',
  manager: '15%',
  updatedAt: '14%',
  finalDate: '10%',
  actions: '10%',
} as const;

export const COLUMN_FILTER_SEARCH_MIN = 2;
export const COLUMN_FILTER_SEARCH_DEBOUNCE_MS = 300;
