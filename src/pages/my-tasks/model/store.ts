import { create } from 'zustand';

import { ALL_TASK_STATUSES } from './kanbanColumns';

import type { TaskStatusFilter, ExecutorApproveFilter } from './utils';
import type { TaskStatus } from '@/entities';

export type TaskViewMode = 'grid' | 'kanban' | 'table';

const VIEW_MODE_KEY = 'my-tasks-view-mode';
const KANBAN_COLUMNS_KEY = 'my-tasks-kanban-columns';

const VIEW_MODES: TaskViewMode[] = ['grid', 'kanban', 'table'];

const readStoredViewMode = (): TaskViewMode => {
  try {
    const stored = localStorage.getItem(VIEW_MODE_KEY);

    if (stored && VIEW_MODES.includes(stored as TaskViewMode)) {
      return stored as TaskViewMode;
    }
  } catch {
    /* ignore */
  }

  return 'grid';
};

const readStoredKanbanColumns = (): TaskStatus[] => {
  try {
    const stored = localStorage.getItem(KANBAN_COLUMNS_KEY);

    if (!stored) return ALL_TASK_STATUSES;

    const parsed = JSON.parse(stored) as TaskStatus[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return ALL_TASK_STATUSES;
    }

    return parsed.filter(status => ALL_TASK_STATUSES.includes(status));
  } catch {
    return ALL_TASK_STATUSES;
  }
};

type MyTaskFilterStore = {
  postId: string;
  viewMode: TaskViewMode;
  status: TaskStatusFilter;
  updatedDate: string | null;
  visibleKanbanColumns: TaskStatus[];
  executorApproveFilter: ExecutorApproveFilter;

  resetKanbanColumns: () => void;
  setPostId: (postId: string) => void;
  setStatus: (status: TaskStatusFilter) => void;
  setViewMode: (viewMode: TaskViewMode) => void;
  toggleKanbanColumn: (status: TaskStatus) => void;
  setUpdatedDate: (updatedDate: string | null) => void;
  setExecutorApproveFilter: (filter: ExecutorApproveFilter) => void;

  isChangedFilters: () => boolean;
};

export const useMyTaskFilterStore = create<MyTaskFilterStore>((set, get) => ({
  postId: 'all',
  status: 'all',
  updatedDate: null,
  viewMode: readStoredViewMode(),
  visibleKanbanColumns: readStoredKanbanColumns(),
  executorApproveFilter: 'active',

  setPostId: postId => set({ postId }),
  isChangedFilters: () => {
    return (
      get().status !== 'all' ||
      get().updatedDate !== null ||
      get().executorApproveFilter !== 'active' ||
      get().visibleKanbanColumns.length !== ALL_TASK_STATUSES.length
    );
  },

  setStatus: status => set({ status }),
  setViewMode: viewMode => set({ viewMode }),
  setUpdatedDate: updatedDate => set({ updatedDate }),
  setExecutorApproveFilter: executorApproveFilter =>
    set({ executorApproveFilter }),

  toggleKanbanColumn: status => {
    set(state => {
      if (state.visibleKanbanColumns.includes(status)) {
        if (state.visibleKanbanColumns.length <= 1) return state;

        return {
          visibleKanbanColumns: state.visibleKanbanColumns.filter(
            item => item !== status,
          ),
        };
      }

      return {
        visibleKanbanColumns: [...state.visibleKanbanColumns, status],
      };
    });
  },

  resetKanbanColumns: () => set({ visibleKanbanColumns: ALL_TASK_STATUSES }),
}));

useMyTaskFilterStore.subscribe((state, prev) => {
  if (state.viewMode !== prev.viewMode) {
    localStorage.setItem(VIEW_MODE_KEY, state.viewMode);
  }

  if (state.visibleKanbanColumns !== prev.visibleKanbanColumns) {
    localStorage.setItem(
      KANBAN_COLUMNS_KEY,
      JSON.stringify(state.visibleKanbanColumns),
    );
  }
});
