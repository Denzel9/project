import type { DashboardTileType } from '@/entities/user-config'

export const areSameTiles = (
  left: DashboardTileType[],
  right: DashboardTileType[],
) => {
  if (left.length !== right.length) return false

  return left.every((type, index) => type === right[index])
}

export type DashboardSwitchKey =
  | 'dashboardShowTasks'
  | 'dashboardShowActivity'
  | 'dashboardShowComments'
  | 'dashboardShowCalendar'
  | 'dashboardShowChats'

export const DASHBOARD_SWITCHES: {
  key: DashboardSwitchKey
  title: string
  description: string
}[] = [
  {
    key: 'dashboardShowTasks',
    title: 'Задачи',
    description: 'Просмотр и создание задач',
  },
  {
    key: 'dashboardShowActivity',
    title: 'Активность',
    description: 'Просмотр активности',
  },
  {
    key: 'dashboardShowComments',
    title: 'Комментарии',
    description: 'Просмотр и создание комментариев',
  },
  {
    key: 'dashboardShowCalendar',
    title: 'Календарь',
    description: 'Просмотр и создание событий в календаре',
  },
  {
    key: 'dashboardShowChats',
    title: 'Чаты',
    description: 'Просмотр и отправка сообщений в чатах',
  },
]
