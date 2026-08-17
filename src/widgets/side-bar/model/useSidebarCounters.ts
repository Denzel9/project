import { useApplicationStatsQuery } from '@/entities/application'
import { useChatUnreadCountQuery } from '@/entities/chat'
import { useTaskStatsQuery } from '@/entities/task'
import { USER_ROLE } from '@/entities/user'
import { useAuthStore } from '@/features'

import type { SidebarBadgeKey } from './types/types'

export type { SidebarBadgeKey }

export type SidebarCounters = Record<SidebarBadgeKey, number>

export const useSidebarCounters = (): SidebarCounters => {
  const { isAuth, role, isPrime } = useAuthStore()
  const isMarketplaceParticipant =
    role === USER_ROLE.COMPANY ||
    role === USER_ROLE.CREATOR ||
    role === USER_ROLE.MANAGER
  const isMarketplaceTrader =
    role === USER_ROLE.COMPANY || role === USER_ROLE.CREATOR

  const { data: chatUnread } = useChatUnreadCountQuery({
    enabled: isAuth && isMarketplaceParticipant,
  })

  const { data: applicationStats } = useApplicationStatsQuery({
    enabled: isAuth && role === USER_ROLE.COMPANY,
  })

  const { data: taskStats } = useTaskStatsQuery(undefined, {
    enabled: isAuth && isPrime && isMarketplaceTrader,
  })

  const applications =
    role === USER_ROLE.COMPANY ? (applicationStats?.incomingNew ?? 0) : 0

  return {
    chat: chatUnread?.count ?? 0,
    applications,
    tasks: taskStats?.awaitingAction ?? 0,
  }
}
