import { TASK_STATUS_ENUM, type Task, type TaskListParams, type TaskRole, type TaskStatus } from '@/entities/task';

export type TaskRoleFilter = TaskRole | 'all';
export type TaskStatusFilter = TaskStatus | 'all';
export type FastButtonValueType =
  | 'pending-action'
  | 'pending-executor-assign'
  | 'cancelled';

export const getKanbanColumnsForFastButton = (
  fastButtonValue: FastButtonValueType,
): TaskStatus[] => {
  switch (fastButtonValue) {
    case 'pending-action':
      return [
        TASK_STATUS_ENUM.PREPARING,
        TASK_STATUS_ENUM.PENDING_APPROVAL,
        TASK_STATUS_ENUM.IN_PROGRESS,
        TASK_STATUS_ENUM.REVISION,
        TASK_STATUS_ENUM.CHECKING,
      ];
    case 'pending-executor-assign':
      return [TASK_STATUS_ENUM.PREPARING];
    case 'cancelled':
      return [
        TASK_STATUS_ENUM.CANCELLED,
        TASK_STATUS_ENUM.CANCELLED_EXECUTOR,
      ];
  }
};

export const filterTasksByExecutorApprove = (
  tasks: Task[],
  filter: FastButtonValueType,
  isCompany: boolean,
): Task[] => {
  switch (filter) {
    // Ожидают действие
    case 'pending-action':
      return tasks.filter(task => {
        if (task.executorId && task.isExecutorApprove && task?.status !== TASK_STATUS_ENUM.COMPLETED) {
          return isCompany ? task.isCompanyAction : !task.isCompanyAction;
        }

        return false;
      });
    case 'pending-executor-assign':
      return tasks.filter(task => {
        return task?.executorId && task.isExecutorApprove === null && ![TASK_STATUS_ENUM.CANCELLED, TASK_STATUS_ENUM.CANCELLED_EXECUTOR].includes(task.status as TASK_STATUS_ENUM)
      });
    case 'cancelled':
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
