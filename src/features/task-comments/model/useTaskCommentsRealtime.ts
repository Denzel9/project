import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

import {
  appendTaskCommentToCache,
  applyTaskCommentsReadInCache,
  incrementTaskWithCommentsUnread,
  removeTaskCommentFromCache,
  setTaskWithCommentsUnread,
  updateTaskCommentInCache,
  useMarkTaskCommentsReadMutation,
  type TaskComment,
  type TaskCommentDeletedEvent,
  type TaskCommentsReadEvent,
} from '@/entities/task'
import { useAuthStore } from '@/features/auth'
import taskCommentsSocket from '@/shared/api/taskCommentsSocket'

type UseTaskCommentsRealtimeOptions = {
  taskId: string | null | undefined
  enabled?: boolean
  markReadOnJoin?: boolean
}

export const useTaskCommentsRealtime = ({
  taskId,
  enabled = true,
  markReadOnJoin = true,
}: UseTaskCommentsRealtimeOptions) => {
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore(state => state.id)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [socketError, setSocketError] = useState<string | null>(null)

  const taskIdRef = useRef(taskId)
  const currentUserIdRef = useRef(currentUserId)
  const markReadMutation = useMarkTaskCommentsReadMutation()

  useEffect(() => {
    taskIdRef.current = taskId
  }, [taskId])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    if (!enabled || !taskId) {
      return
    }

    const handleComment = (comment: TaskComment) => {
      appendTaskCommentToCache(queryClient, comment)

      const activeTaskId = taskIdRef.current
      const userId = currentUserIdRef.current

      if (activeTaskId === comment.taskId) {
        setTaskWithCommentsUnread(queryClient, comment.taskId, 0)

        if (userId && comment.authorId !== userId) {
          taskCommentsSocket.markCommentsRead(comment.taskId)
        }

        return
      }

      if (userId && comment.authorId !== userId) {
        incrementTaskWithCommentsUnread(queryClient, comment.taskId)
      }
    }

    const handleCommentEdited = (comment: TaskComment) => {
      updateTaskCommentInCache(queryClient, comment)
    }

    const handleCommentDeleted = (event: TaskCommentDeletedEvent) => {
      removeTaskCommentFromCache(queryClient, event.taskId, event.commentId)
    }

    const handleCommentsRead = (event: TaskCommentsReadEvent) => {
      const userId = currentUserIdRef.current

      if (!userId || event.userId === userId) {
        return
      }

      applyTaskCommentsReadInCache(
        queryClient,
        event.taskId,
        event.readAt,
        userId,
      )
    }

    const handleError = (error: { message: string }) => {
      setSocketError(error.message || 'Ошибка соединения комментариев')
    }

    const handleConnect = () => {
      setIsSocketConnected(true)
      setSocketError(null)

      if (taskIdRef.current) {
        taskCommentsSocket.joinTask(taskIdRef.current)
      }
    }

    const handleDisconnect = () => {
      setIsSocketConnected(false)
    }

    taskCommentsSocket.onComment(handleComment)
    taskCommentsSocket.onCommentEdited(handleCommentEdited)
    taskCommentsSocket.onCommentDeleted(handleCommentDeleted)
    taskCommentsSocket.onCommentsRead(handleCommentsRead)
    taskCommentsSocket.onError(handleError)
    taskCommentsSocket.onConnect(handleConnect)
    taskCommentsSocket.onDisconnect(handleDisconnect)

    taskCommentsSocket.connect()
    taskCommentsSocket.joinTask(taskId)
    setIsSocketConnected(taskCommentsSocket.isConnected())

    return () => {
      taskCommentsSocket.leaveTask(taskId)
      taskCommentsSocket.removeListeners()
    }
  }, [enabled, taskId, queryClient])

  useEffect(() => {
    if (!enabled || !taskId || !markReadOnJoin) {
      return
    }

    setTaskWithCommentsUnread(queryClient, taskId, 0)

    if (taskCommentsSocket.isConnected()) {
      taskCommentsSocket.markCommentsRead(taskId)
      return
    }

    markReadMutation.mutate(taskId)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mark once per task open
  }, [enabled, taskId, markReadOnJoin, queryClient])

  return {
    isSocketConnected,
    socketError,
    clearSocketError: () => setSocketError(null),
  }
}
