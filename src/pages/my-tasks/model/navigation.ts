import type { TaskStatus } from '@/entities';

export type MyTasksLocationState = {
  fromDashboard?: boolean;
  scrollToKanbanColumn?: TaskStatus;
};
