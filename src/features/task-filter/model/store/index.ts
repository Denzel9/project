import { create } from 'zustand';

import { type TaskStatus } from '@/entities';

import { ALL_TASK_STATUSES } from '../constants';
import { getKanbanColumnsForFastButton } from '../utils';

import type {
  TaskStatusFilter,
  FastButtonFilter,
  TaskExtraFilter,
  DashboardPeriod,
} from '../utils';

export type TaskViewMode = 'grid' | 'kanban' | 'table';
export type { DashboardPeriod };

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
    executorId: string;
    viewMode: TaskViewMode;
    status: TaskStatusFilter;
    updatedDate: string | null;
    visibleKanbanColumns: TaskStatus[];
    fastButtonValue: FastButtonFilter;
    extraFilter: TaskExtraFilter | null;
    onlyMyTasks: boolean;
    assigneeAccountId: string;
    period: DashboardPeriod;
    isSearchOpen: boolean;
    searchQuery: string;

    resetKanbanColumns: () => void;
    setPostId: (postId: string) => void;
    setExecutorId: (executorId: string) => void;
    setStatus: (status: TaskStatusFilter) => void;
    setExtraFilter: (extraFilter: TaskExtraFilter | null) => void;
    setOnlyMyTasks: (onlyMyTasks: boolean) => void;
    setAssigneeAccountId: (assigneeAccountId: string) => void;
    setPeriod: (period: DashboardPeriod) => void;
    setViewMode: (viewMode: TaskViewMode) => void;
    toggleKanbanColumn: (status: TaskStatus) => void;
    setUpdatedDate: (updatedDate: string | null) => void;
    setFastButtonValue: (fastButtonValue: FastButtonFilter) => void;
    setVisibleKanbanColumns: (visibleKanbanColumns: TaskStatus[]) => void;
    ensureKanbanColumnVisible: (status: TaskStatus) => void;
    setIsSearchOpen: (isSearchOpen: boolean) => void;
    setSearchQuery: (searchQuery: string) => void;
};

const initialViewMode = readStoredViewMode();
const initialFastButtonValue: FastButtonFilter = null;

export const useMyTaskFilterStore = create<MyTaskFilterStore>((set) => ({
    postId: 'all',

    executorId: 'all',

    status: 'all',

    updatedDate: null,

    viewMode: initialViewMode,

    visibleKanbanColumns:
        initialViewMode === 'kanban'
            ? getKanbanColumnsForFastButton(initialFastButtonValue)
            : readStoredKanbanColumns(),

    fastButtonValue: initialFastButtonValue,

    extraFilter: null,

    onlyMyTasks: false,

    assigneeAccountId: 'all',

    period: 'all',

    isSearchOpen: false,

    searchQuery: '',

    setPostId: postId =>
        set({
            postId,
            extraFilter: null,
        }),

    setExecutorId: executorId =>
        set({
            executorId,
            extraFilter: null,
        }),

    setStatus: status =>
        set({
            status,
            extraFilter: null,
        }),

    setExtraFilter: extraFilter =>
        set({
            extraFilter,
            fastButtonValue: null,
            ...(extraFilter && { status: 'all' as const }),
        }),

    setOnlyMyTasks: onlyMyTasks =>
        set({
            onlyMyTasks,
            ...(onlyMyTasks && { assigneeAccountId: 'all' }),
        }),

    setAssigneeAccountId: assigneeAccountId =>
        set({
            assigneeAccountId,
            ...(assigneeAccountId !== 'all' && { onlyMyTasks: false }),
        }),

    setPeriod: period => set({ period }),

    setViewMode: viewMode =>
        set(state => ({
            viewMode,
            ...(viewMode === 'kanban' && {
                visibleKanbanColumns: getKanbanColumnsForFastButton(
                    state.fastButtonValue,
                ),
            }),
        })),

    setUpdatedDate: updatedDate => set({ updatedDate }),

    setFastButtonValue: fastButtonValue =>
        set(state => ({
            fastButtonValue,
            extraFilter: null,
            status: 'all' as const,
            ...(state.viewMode === 'kanban' && {
                visibleKanbanColumns:
                    getKanbanColumnsForFastButton(fastButtonValue),
            }),
        })),

    setVisibleKanbanColumns: visibleKanbanColumns =>
        set({ visibleKanbanColumns }),

    ensureKanbanColumnVisible: status =>
        set(state =>
            state.visibleKanbanColumns.includes(status)
                ? state
                : {
                      visibleKanbanColumns: [...state.visibleKanbanColumns, status],
                  },
        ),

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

    resetKanbanColumns: () =>
        set({ visibleKanbanColumns: [...ALL_TASK_STATUSES] }),

    setIsSearchOpen: isSearchOpen =>
        set(
            isSearchOpen
                ? { isSearchOpen: true }
                : { isSearchOpen: false, searchQuery: '' },
        ),

    setSearchQuery: searchQuery => set({ searchQuery }),
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
