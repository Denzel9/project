import { TASK_STATUS_ENUM, type Task, type TaskListParams, type TaskRole, type TaskStatus } from '@/entities/task';

export type TaskRoleFilter = TaskRole | 'all';
export type TaskStatusFilter = TaskStatus | 'all';
export type ExecutorApproveFilter =
  | 'active'
  | 'pending-confirmation'
  | 'rejected';

export const filterTasksByExecutorApprove = (
  tasks: Task[],
  filter: ExecutorApproveFilter,
): Task[] => {
  switch (filter) {
    case 'active':
      return tasks.filter(task => {
        return task?.executorId &&
          task.isExecutorApprove === true &&
          ![TASK_STATUS_ENUM.CANCELLED, TASK_STATUS_ENUM.CANCELLED_EXECUTOR].includes(task.status as TASK_STATUS_ENUM)
      });
    case 'pending-confirmation':
      return tasks.filter(task => {
        return task?.executorId && task.isExecutorApprove === null && ![TASK_STATUS_ENUM.CANCELLED, TASK_STATUS_ENUM.CANCELLED_EXECUTOR].includes(task.status as TASK_STATUS_ENUM)
      });
    case 'rejected':
      return tasks.filter(task => {
        return task?.executorId && task.isExecutorApprove === false || [TASK_STATUS_ENUM.CANCELLED, TASK_STATUS_ENUM.CANCELLED_EXECUTOR].includes(task.status as TASK_STATUS_ENUM)
      });
  }
};

export const toTasksParams = (
  filters: {
    status: TaskStatusFilter;
    postId?: string;
    updatedDate?: string | null;
  },
  pagination?: { page?: number; limit?: number },
): TaskListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(filters.status !== 'all' && { status: filters.status }),
  ...(filters.postId && { postId: filters.postId }),
  ...(filters.updatedDate && { updatedDate: filters.updatedDate }),
});
