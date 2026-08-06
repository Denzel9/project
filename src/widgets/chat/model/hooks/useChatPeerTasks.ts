import { useMemo } from 'react'

import { useTasksQuery } from '@/entities/task'
import { useAuthStore } from '@/features/auth'

import {
  canUploadChatPhotoReport,
  getChatPeerTasksParams,
  isActiveChatTask,
} from '../utils/utils'

export const useChatPeerTasks = (peerId: string | undefined) => {
  const role = useAuthStore(state => state.role)
  const currentUserId = useAuthStore(state => state.id)

  const params = useMemo(
    () => getChatPeerTasksParams(peerId, role),
    [peerId, role],
  )

  const query = useTasksQuery(params, { enabled: Boolean(params) })

  const peerAssignedTasks = useMemo(
    () => query.data?.items ?? [],
    [query.data?.items],
  )

  const activeTasks = useMemo(
    () => (query.data?.items ?? []).filter(isActiveChatTask),
    [query.data?.items],
  )

  const photoReportTasks = useMemo(
    () =>
      activeTasks.filter(task =>
        canUploadChatPhotoReport(task, currentUserId),
      ),
    [activeTasks, currentUserId],
  )

  return {
    ...query,
    peerAssignedTasks,
    activeTasks,
    photoReportTasks,
    hasActiveTasks: activeTasks.length > 0,
    canAddPhotoReport: photoReportTasks.length > 0,
  }
}
