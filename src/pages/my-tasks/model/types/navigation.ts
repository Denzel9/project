import type { TaskStatus } from '@/entities';

export type MyTasksLocationState = {
  fromDashboard?: boolean;
  skipDefaultFastFilter?: boolean;
  scrollToKanbanColumn?: TaskStatus;
};
