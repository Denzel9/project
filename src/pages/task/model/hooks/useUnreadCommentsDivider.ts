import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import {
  getTaskWithCommentsUnread,
  getUnreadDividerCommentId,
  type TaskComment,
} from '@/entities/task'

type UseUnreadCommentsDividerParams = {
  taskId: string | null | undefined
  comments: TaskComment[]
  currentUserId: string | null
  isLoading?: boolean
  /** Unread count known before mark-read (e.g. inbox badge). */
  initialUnreadCount?: number
}

export const useUnreadCommentsDivider = ({
  taskId,
  comments,
  currentUserId,
  isLoading = false,
  initialUnreadCount,
}: UseUnreadCommentsDividerParams) => {
  const queryClient = useQueryClient()
  const openingUnreadCountRef = useRef(0)
  const lastTaskIdRef = useRef<string | null>(null)
  const resolvedForTaskRef = useRef<string | null>(null)
  const [unreadDividerCommentId, setUnreadDividerCommentId] = useState<
    string | null
  >(null)

  if (taskId !== lastTaskIdRef.current) {
    lastTaskIdRef.current = taskId ?? null
    resolvedForTaskRef.current = null

    if (taskId) {
      const fromProp =
        initialUnreadCount != null && initialUnreadCount > 0
          ? initialUnreadCount
          : 0
      const fromCache = getTaskWithCommentsUnread(queryClient, taskId)
      openingUnreadCountRef.current = fromProp > 0 ? fromProp : fromCache
    } else {
      openingUnreadCountRef.current = 0
    }
  }

  useEffect(() => {
    if (!taskId) {
      setUnreadDividerCommentId(null)
      return
    }

    setUnreadDividerCommentId(null)
  }, [taskId])

  useEffect(() => {
    if (!taskId || isLoading || !currentUserId || comments.length === 0) {
      return
    }

    if (resolvedForTaskRef.current === taskId) {
      return
    }

    const openingUnreadCount = openingUnreadCountRef.current

    if (openingUnreadCount <= 0) {
      resolvedForTaskRef.current = taskId
      return
    }

    setUnreadDividerCommentId(
      getUnreadDividerCommentId(comments, currentUserId, openingUnreadCount),
    )
    openingUnreadCountRef.current = 0
    resolvedForTaskRef.current = taskId
  }, [taskId, isLoading, currentUserId, comments])

  return unreadDividerCommentId
}
