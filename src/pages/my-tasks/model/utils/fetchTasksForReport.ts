import { fetchAllTasks, type Task } from '@/entities';
import { toMyTasksQueryParams } from '@/features';

import type { FastButtonFilter, TaskExtraFilter, TaskStatusFilter, TaskViewMode } from '@/features';

type FetchTasksForReportOptions = {
  postId: string;
  executorId: string;
  viewMode: TaskViewMode;
  status: TaskStatusFilter;
  updatedDate: string | null;
  fastButtonValue: FastButtonFilter;
  extraFilter?: TaskExtraFilter | null;
  onlyMyTasks?: boolean;
  assigneeAccountId?: string;
  isCompany: boolean;
  q?: string;
  taskId?: string;
  deadlineDate?: string | null;
};

export const fetchTasksForReport = async (
  options: FetchTasksForReportOptions,
): Promise<Task[]> => {
  const params = toMyTasksQueryParams({
    ...options,
    extraFilter: options.extraFilter ?? null,
  });

  return fetchAllTasks(params);
};
