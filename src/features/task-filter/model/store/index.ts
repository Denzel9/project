import { create } from 'zustand';

import { type Task, type TaskStatus } from '@/entities';

import { ALL_TASK_STATUSES, MAX_SELECTED_TASKS } from '../constants';
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
const GROUP_BY_POST_KEY = 'my-tasks-group-by-post';

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

const readStoredGroupByPost = (): boolean => {
    try {
        return localStorage.getItem(GROUP_BY_POST_KEY) === 'true';
    } catch {
        return false;
    }
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
    groupByPost: boolean;
    isTaskSelectionMode: boolean;
    selectedTaskIds: string[];
    selectedTasks: Task[];

    resetKanbanColumns: () => void;
    resetForProfileSwitch: () => void;
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
    setGroupByPost: (groupByPost: boolean) => void;
    setTaskSelectionMode: (isTaskSelectionMode: boolean) => void;
    toggleTaskSelection: (task: Task) => boolean;
    removeTasksFromSelection: (taskIds: string[]) => void;
    clearTaskSelection: () => void;
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

    groupByPost: readStoredGroupByPost(),

    isTaskSelectionMode: false,

    selectedTaskIds: [],

    selectedTasks: [],

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
        set(state => {
            if (state.viewMode === viewMode) return state;

            return {
                viewMode,
                status: 'all' as const,
                postId: 'all',
                executorId: 'all',
                extraFilter: null,
                updatedDate: null,
                fastButtonValue: null,
                onlyMyTasks: false,
                assigneeAccountId: 'all',
                isSearchOpen: false,
                searchQuery: '',
                isTaskSelectionMode: false,
                selectedTaskIds: [],
                selectedTasks: [],
                ...(viewMode === 'kanban' && {
                    visibleKanbanColumns: getKanbanColumnsForFastButton(null),
                }),
            };
        }),

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

    resetForProfileSwitch: () =>
        set({
            postId: 'all',
            executorId: 'all',
            status: 'all',
            updatedDate: null,
            fastButtonValue: null,
            extraFilter: null,
            onlyMyTasks: false,
            assigneeAccountId: 'all',
            period: 'all',
            isSearchOpen: false,
            searchQuery: '',
            isTaskSelectionMode: false,
            selectedTaskIds: [],
            selectedTasks: [],
        }),

    setIsSearchOpen: isSearchOpen =>
        set(
            isSearchOpen
                ? { isSearchOpen: true }
                : { isSearchOpen: false, searchQuery: '' },
        ),

    setSearchQuery: searchQuery => set({ searchQuery }),

    setGroupByPost: groupByPost =>
        set({
            groupByPost,
            ...(groupByPost && {
                isTaskSelectionMode: false,
                selectedTaskIds: [],
                selectedTasks: [],
            }),
        }),

    setTaskSelectionMode: isTaskSelectionMode =>
        set(() => ({
            isTaskSelectionMode,
            ...(isTaskSelectionMode
                ? {
                    groupByPost: false,
                }
                : { selectedTaskIds: [], selectedTasks: [] }),
        })),

    toggleTaskSelection: task => {
        let didToggle = true;

        set(state => {
            if (state.selectedTaskIds.includes(task.id)) {
                return {
                    selectedTaskIds: state.selectedTaskIds.filter(
                        id => id !== task.id,
                    ),
                    selectedTasks: state.selectedTasks.filter(
                        item => item.id !== task.id,
                    ),
                };
            }

            if (state.selectedTaskIds.length >= MAX_SELECTED_TASKS) {
                didToggle = false;
                return state;
            }

            return {
                selectedTaskIds: [...state.selectedTaskIds, task.id],
                selectedTasks: [...state.selectedTasks, task],
            };
        });

        return didToggle;
    },

    removeTasksFromSelection: taskIds =>
        set(state => ({
            selectedTaskIds: state.selectedTaskIds.filter(
                id => !taskIds.includes(id),
            ),
            selectedTasks: state.selectedTasks.filter(
                task => !taskIds.includes(task.id),
            ),
        })),

    clearTaskSelection: () =>
        set({
            isTaskSelectionMode: false,
            selectedTaskIds: [],
            selectedTasks: [],
        }),
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

    if (state.groupByPost !== prev.groupByPost) {
        localStorage.setItem(GROUP_BY_POST_KEY, String(state.groupByPost));
    }
});
