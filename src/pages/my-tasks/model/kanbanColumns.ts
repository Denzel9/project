import { TASK_STATUS_LABELS } from '@/entities/task';

import type { TaskStatus } from '@/entities/task';

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
  { status: 'PREPARING', label: TASK_STATUS_LABELS.PREPARING, color: 'info' },
  {
    status: 'PENDING_APPROVAL',
    label: TASK_STATUS_LABELS.PENDING_APPROVAL,
    color: 'success',
  },
  {
    status: 'IN_PROGRESS',
    label: TASK_STATUS_LABELS.IN_PROGRESS,
    color: 'primary',
  },
  { status: 'REVISION', label: TASK_STATUS_LABELS.REVISION, color: 'warning' },
  { status: 'CHECKING', label: TASK_STATUS_LABELS.CHECKING, color: 'info' },
  { status: 'COMPLETED', label: TASK_STATUS_LABELS.COMPLETED, color: 'success' },
  { status: 'CANCELLED', label: TASK_STATUS_LABELS.CANCELLED, color: 'error' },
];

export const ALL_TASK_STATUSES: TaskStatus[] = KANBAN_COLUMNS.map(
  column => column.status,
);

export const getKanbanColumnConfig = (status: TaskStatus) =>
  KANBAN_COLUMNS.find(column => column.status === status);
