export const TASK_TABLE_PAGE_SIZE = 20;
export const KANBAN_COLUMN_PAGE_SIZE = 20;

export const TASK_TABLE_COLUMN_WIDTHS = {
  title: '20%',
  status: '15%',
  customer: '15%',
  updatedAt: '14%',
  finalDate: '10%',
  actions: '16%',
} as const;

export const COLUMN_FILTER_SEARCH_MIN = 2;
export const COLUMN_FILTER_SEARCH_DEBOUNCE_MS = 300;
