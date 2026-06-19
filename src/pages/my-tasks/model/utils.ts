import type { TaskListParams, TaskRole, TaskStatus } from '@/entities/task';

export type TaskRoleFilter = TaskRole | 'all';
export type TaskStatusFilter = TaskStatus | 'all';

export const toTasksParams = (
  filters: {
    role: TaskRoleFilter;
    status: TaskStatusFilter;
    updatedDate?: string | null;
  },
  pagination?: { page?: number; limit?: number },
): TaskListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.role !== 'all' && { role: filters.role }),
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
});
