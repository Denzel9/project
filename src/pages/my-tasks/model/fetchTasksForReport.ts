import { fetchAllTasks, type Task } from '@/entities';
import { toMyTasksQueryParams } from '@/features';

import type { FastButtonFilter, TaskExtraFilter, TaskStatusFilter, TaskViewMode } from '@/features';

type FetchTasksForReportOptions = {
  postId: string;
  viewMode: TaskViewMode;
  status: TaskStatusFilter;
  updatedDate: string | null;
  fastButtonValue: FastButtonFilter;
  extraFilter?: TaskExtraFilter | null;
  isCompany: boolean;
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
