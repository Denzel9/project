import type { TaskStats } from './types'

export type TaskStatsCategory =
  | 'pending-action'
  | 'pending-executor-assign'
  | 'no-executor-assign'
  | 'cancelled'
  | 'overdue'
  | 'urgent'
  | 'checking'

export const TASK_STATS_BY_CATEGORY: Record<
  TaskStatsCategory,
  keyof TaskStats
> = {
  'pending-action': 'awaitingAction',
  'pending-executor-assign': 'awaitingConfirmation',
  'no-executor-assign': 'unassigned',
  cancelled: 'cancelled',
  overdue: 'overdue',
  urgent: 'urgent',
  checking: 'underReview',
}

export const getTaskStatsCount = (
  category: TaskStatsCategory,
  stats?: TaskStats,
): number => stats?.[TASK_STATS_BY_CATEGORY[category]] ?? 0
