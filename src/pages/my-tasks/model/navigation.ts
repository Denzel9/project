import type { TaskStatus } from '@/entities';

export type MyTasksLocationState = {
  fromDashboard?: boolean;
  /** Skip applying default fast filter (e.g. navigation with partner filter). */
  skipDefaultFastFilter?: boolean;
  scrollToKanbanColumn?: TaskStatus;
};
