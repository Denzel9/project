import type { NotificationType } from '@/entities/notification'

export const DASHBOARD_TILE_TYPE = {
  PENDING_ACTION: 'PENDING_ACTION',
  PENDING_EXECUTOR_ASSIGN: 'PENDING_EXECUTOR_ASSIGN',
  NO_EXECUTOR_ASSIGN: 'NO_EXECUTOR_ASSIGN',
  OVERDUE: 'OVERDUE',
  URGENT: 'URGENT',
  CHECKING: 'CHECKING',
  CANCELLED: 'CANCELLED',
} as const

export type DashboardTileType =
  (typeof DASHBOARD_TILE_TYPE)[keyof typeof DASHBOARD_TILE_TYPE]

export const DASHBOARD_TILE_TYPES: DashboardTileType[] = [
  DASHBOARD_TILE_TYPE.PENDING_ACTION,
  DASHBOARD_TILE_TYPE.PENDING_EXECUTOR_ASSIGN,
  DASHBOARD_TILE_TYPE.NO_EXECUTOR_ASSIGN,
  DASHBOARD_TILE_TYPE.CANCELLED,
  DASHBOARD_TILE_TYPE.OVERDUE,
  DASHBOARD_TILE_TYPE.URGENT,
  DASHBOARD_TILE_TYPE.CHECKING,
]

/** kebab-case variants used by dashboard cards / task filters */
export type DashboardTileVariant =
  | 'pending-action'
  | 'pending-executor-assign'
  | 'no-executor-assign'
  | 'overdue'
  | 'urgent'
  | 'checking'
  | 'cancelled'

export const DASHBOARD_TILE_VARIANT_BY_TYPE: Record<
  DashboardTileType,
  DashboardTileVariant
> = {
  PENDING_ACTION: 'pending-action',
  PENDING_EXECUTOR_ASSIGN: 'pending-executor-assign',
  NO_EXECUTOR_ASSIGN: 'no-executor-assign',
  CANCELLED: 'cancelled',
  OVERDUE: 'overdue',
  URGENT: 'urgent',
  CHECKING: 'checking',
}

export const DASHBOARD_TILE_TYPE_BY_VARIANT: Record<
  DashboardTileVariant,
  DashboardTileType
> = {
  'pending-action': DASHBOARD_TILE_TYPE.PENDING_ACTION,
  'pending-executor-assign': DASHBOARD_TILE_TYPE.PENDING_EXECUTOR_ASSIGN,
  'no-executor-assign': DASHBOARD_TILE_TYPE.NO_EXECUTOR_ASSIGN,
  cancelled: DASHBOARD_TILE_TYPE.CANCELLED,
  overdue: DASHBOARD_TILE_TYPE.OVERDUE,
  urgent: DASHBOARD_TILE_TYPE.URGENT,
  checking: DASHBOARD_TILE_TYPE.CHECKING,
}

export const toDashboardTileVariant = (
  type: DashboardTileType,
): DashboardTileVariant => DASHBOARD_TILE_VARIANT_BY_TYPE[type]

export const toDashboardTileType = (
  variant: DashboardTileVariant,
): DashboardTileType => DASHBOARD_TILE_TYPE_BY_VARIANT[variant]

export type UserConfig = {
  id: string
  userId: string
  inAppNotificationTypes: NotificationType[]
  emailNotificationTypes: NotificationType[]
  dashboardTiles: DashboardTileType[]
  dashboardShowTasks: boolean
  dashboardShowActivity: boolean
  dashboardShowComments: boolean
  dashboardShowCalendar: boolean
  dashboardShowChats: boolean
  createdAt: string
  updatedAt: string
}

export type UpdateUserConfigDto = {
  inAppNotificationTypes?: NotificationType[]
  emailNotificationTypes?: NotificationType[]
  dashboardTiles?: DashboardTileType[]
  dashboardShowTasks?: boolean
  dashboardShowActivity?: boolean
  dashboardShowComments?: boolean
  dashboardShowCalendar?: boolean
  dashboardShowChats?: boolean
}
