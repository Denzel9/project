import { create } from 'zustand';

import { ALL_TASK_STATUSES } from '../constants';
import { getKanbanColumnsForFastButton } from '../utils';

import type {
  TaskStatusFilter,
  FastButtonValueType,
  TaskExtraFilter,
} from '../utils';
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
    fastButtonValue: FastButtonValueType;
    extraFilter: TaskExtraFilter | null;

    resetKanbanColumns: () => void;
    setPostId: (postId: string) => void;
    setStatus: (status: TaskStatusFilter) => void;
    setExtraFilter: (extraFilter: TaskExtraFilter | null) => void;
    setViewMode: (viewMode: TaskViewMode) => void;
    toggleKanbanColumn: (status: TaskStatus) => void;
    setUpdatedDate: (updatedDate: string | null) => void;
    setFastButtonValue: (fastButtonValue: FastButtonValueType) => void;
    setVisibleKanbanColumns: (visibleKanbanColumns: TaskStatus[]) => void;
};

const initialViewMode = readStoredViewMode();
const initialFastButtonValue: FastButtonValueType = 'pending-action';

export const useMyTaskFilterStore = create<MyTaskFilterStore>((set) => ({
    postId: 'all',

    status: 'all',

    updatedDate: null,

    viewMode: initialViewMode,

    visibleKanbanColumns:
        initialViewMode === 'kanban'
            ? getKanbanColumnsForFastButton(initialFastButtonValue)
            : readStoredKanbanColumns(),

    fastButtonValue: initialFastButtonValue,

    extraFilter: null,

    setPostId: postId => set({ postId, extraFilter: null }),

    setStatus: status => set({ status, extraFilter: null }),

    setExtraFilter: extraFilter =>
        set({
            extraFilter,
            ...(extraFilter && { status: 'all' as const }),
        }),

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
            ...(state.viewMode === 'kanban' && {
                visibleKanbanColumns:
                    getKanbanColumnsForFastButton(fastButtonValue),
            }),
        })),

    setVisibleKanbanColumns: visibleKanbanColumns =>
        set({ visibleKanbanColumns }),

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
