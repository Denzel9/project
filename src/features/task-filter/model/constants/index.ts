import { TASK_STATUS_ENUM, TASK_STATUS_LABELS, type TaskStatus } from "@/entities";

export type KanbanColumnColor =
    | 'info'
    | 'warning'
    | 'primary'
    | 'error'
    | 'success'
    | 'secondary';

export type KanbanColumnConfig = {
    status: TaskStatus;
    label: string;
    color: KanbanColumnColor;
};

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
    { status: TASK_STATUS_ENUM.PREPARING, label: TASK_STATUS_LABELS.PREPARING, color: 'info' },
    {
        status: TASK_STATUS_ENUM.PENDING_APPROVAL,
        label: TASK_STATUS_LABELS.PENDING_APPROVAL,
        color: 'success',
    },
    {
        status: TASK_STATUS_ENUM.IN_PROGRESS,
        label: TASK_STATUS_LABELS.IN_PROGRESS,
        color: 'primary',
    },
    { status: TASK_STATUS_ENUM.REVISION, label: TASK_STATUS_LABELS.REVISION, color: 'warning' },
    { status: TASK_STATUS_ENUM.CHECKING, label: TASK_STATUS_LABELS.CHECKING, color: 'info' },
    { status: TASK_STATUS_ENUM.COMPLETED, label: TASK_STATUS_LABELS.COMPLETED, color: 'success' },
    { status: TASK_STATUS_ENUM.CANCELLED, label: TASK_STATUS_LABELS.CANCELLED, color: 'error' },
    { status: TASK_STATUS_ENUM.CANCELLED_EXECUTOR, label: TASK_STATUS_LABELS.CANCELLED_EXECUTOR, color: 'error' },
];

export const ALL_TASK_STATUSES: TaskStatus[] = KANBAN_COLUMNS.map(
    column => column.status,
);

export const getTaskConfig = (status: TaskStatus) =>
    KANBAN_COLUMNS.find(column => column.status === status);
