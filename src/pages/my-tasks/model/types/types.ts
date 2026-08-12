import type { Task, TaskStatus } from "@/entities";

export type TaskSortField =
  | 'title'
  | 'status'
  | 'customer'
  | 'manager'
  | 'updatedAt'
  | 'finalDate';

export type TaskSortOrder = 'asc' | 'desc';

export type FilterOption = {
  id: string;
  label: string;
};

export type TaskTableColumnFilters = {
  status: TaskStatus | 'all';
  manager: string | 'all';
  taskId: string;
  taskQuery: string;
  personId: string;
  urgentOnly: boolean;
  updatedDate: string | null;
  deadlineDate: string | null;
  personLabel: string;
  onStatusChange: (value: TaskStatus | 'all') => void;
  onTaskIdChange: (value: string) => void;
  onTaskQueryChange: (value: string) => void;
  onPersonIdChange: (value: string) => void;
  onUrgentOnlyChange: (value: boolean) => void;
  onUpdatedDateChange: (value: string | null) => void;
  onDeadlineDateChange: (value: string | null) => void;
};

export type TaskTableListState = {
  total: number;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
};

export type TaskTableProps = {
  tasks?: Task[];
  total?: number;
  page?: number;
  embedded?: boolean;
  forPrint?: boolean;
  isCompany?: boolean;
  paginated?: boolean;
  serverPagination?: boolean;
  rowsPerPage?: number;
  querySource?: 'dashboard';
  emptyText?: string;
  columnFilters?: TaskTableColumnFilters;
  onPageChange?: (event: unknown, nextPage: number) => void;
  onListStateChange?: (state: TaskTableListState) => void;
};

