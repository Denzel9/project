import { io, type Socket } from 'socket.io-client'

import type {
  TaskComment,
  TaskCommentDeletedEvent,
  TaskCommentMedia,
  TaskCommentsReadEvent,
} from '@/entities/task'

type SendCommentPayload = {
  taskId: string
  content?: string
  media?: TaskCommentMedia[]
}

type EditCommentPayload = {
  taskId: string
  commentId: string
  content: string
}

type DeleteCommentPayload = {
  taskId: string
  commentId: string
}

type SocketErrorPayload = {
  message: string
}

const getTaskCommentsSocketUrl = () => {
  const base = import.meta.env.VITE_API_URL_BACKEND as string
  return `${base.replace(/\/$/, '')}/task-comments`
}

class TaskCommentsSocketService {
  private socket: Socket | null = null
  private onCommentCallback: ((comment: TaskComment) => void) | null = null
  private onCommentEditedCallback: ((comment: TaskComment) => void) | null =
    null
  private onCommentDeletedCallback:
    | ((event: TaskCommentDeletedEvent) => void)
    | null = null
  private onCommentsReadCallback:
    | ((event: TaskCommentsReadEvent) => void)
    | null = null
  private onErrorCallback: ((error: SocketErrorPayload) => void) | null = null
  private onConnectCallback: (() => void) | null = null
  private onDisconnectCallback: (() => void) | null = null
  private pendingTaskId: string | null = null

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket
    }

    if (!this.socket) {
      this.socket = io(getTaskCommentsSocketUrl(), {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      this.socket.on('connect', () => {
        this.bindSocketEvents()

        if (this.pendingTaskId) {
          this.emitJoinTask(this.pendingTaskId)
        }

        this.onConnectCallback?.()
      })

      this.socket.on('disconnect', () => {
        this.onDisconnectCallback?.()
      })
    } else if (!this.socket.connected) {
      this.socket.connect()
    }

    return this.socket
  }

  private bindSocketEvents() {
    if (!this.socket) return

    this.socket.off('comment')
    this.socket.off('comment_edited')
    this.socket.off('comment_deleted')
    this.socket.off('comments_read')
    this.socket.off('error')

    this.socket.on('comment', (comment: TaskComment) => {
      this.onCommentCallback?.(comment)
    })

    this.socket.on('comment_edited', (comment: TaskComment) => {
      this.onCommentEditedCallback?.(comment)
    })

    this.socket.on('comment_deleted', (event: TaskCommentDeletedEvent) => {
      this.onCommentDeletedCallback?.(event)
    })

    this.socket.on('comments_read', (event: TaskCommentsReadEvent) => {
      this.onCommentsReadCallback?.(event)
    })

    this.socket.on('error', (error: SocketErrorPayload) => {
      this.onErrorCallback?.(error)
    })
  }

  private emitJoinTask(taskId: string) {
    this.socket?.emit('join_task', { taskId })
  }

  private emitLeaveTask(taskId: string) {
    this.socket?.emit('leave_task', { taskId })
  }

  joinTask(taskId: string): void {
    if (this.pendingTaskId && this.pendingTaskId !== taskId) {
      this.leaveTask(this.pendingTaskId)
    }

    this.pendingTaskId = taskId
    this.connect()

    if (this.socket?.connected) {
      this.emitJoinTask(taskId)
    }
  }

  leaveTask(taskId: string): void {
    if (this.pendingTaskId === taskId) {
      this.pendingTaskId = null
    }

    if (this.socket?.connected) {
      this.emitLeaveTask(taskId)
    }
  }

  markCommentsRead(taskId: string): void {
    this.connect()

    const emit = () => {
      this.socket?.emit('mark_comments_read', { taskId })
    }

    if (this.socket?.connected) {
      emit()
      return
    }

    this.socket?.once('connect', emit)
  }

  sendComment(payload: SendCommentPayload): void {
    const hasContent = Boolean(payload.content?.trim())
    const hasMedia = Boolean(payload.media?.length)

    if (!hasContent && !hasMedia) {
      return
    }

    this.connect()

    const emit = () => {
      this.socket?.emit('send_comment', {
        taskId: payload.taskId,
        ...(hasContent ? { content: payload.content!.trim() } : {}),
        ...(hasMedia ? { media: payload.media } : {}),
      })
    }

    if (this.socket?.connected) {
      emit()
      return
    }

    this.socket?.once('connect', emit)
  }

  editComment(payload: EditCommentPayload): void {
    this.connect()

    const emit = () => {
      this.socket?.emit('edit_comment', payload)
    }

    if (this.socket?.connected) {
      emit()
      return
    }

    this.socket?.once('connect', emit)
  }

  deleteComment(payload: DeleteCommentPayload): void {
    this.connect()

    const emit = () => {
      this.socket?.emit('delete_comment', payload)
    }

    if (this.socket?.connected) {
      emit()
      return
    }

    this.socket?.once('connect', emit)
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }

    this.pendingTaskId = null
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  onComment(callback: (comment: TaskComment) => void) {
    this.onCommentCallback = callback
  }

  onCommentEdited(callback: (comment: TaskComment) => void) {
    this.onCommentEditedCallback = callback
  }

  onCommentDeleted(callback: (event: TaskCommentDeletedEvent) => void) {
    this.onCommentDeletedCallback = callback
  }

  onCommentsRead(callback: (event: TaskCommentsReadEvent) => void) {
    this.onCommentsReadCallback = callback
  }

  onError(callback: (error: SocketErrorPayload) => void) {
    this.onErrorCallback = callback
  }

  onConnect(callback: () => void) {
    this.onConnectCallback = callback
  }

  onDisconnect(callback: () => void) {
    this.onDisconnectCallback = callback
  }

  removeListeners() {
    this.onCommentCallback = null
    this.onCommentEditedCallback = null
    this.onCommentDeletedCallback = null
    this.onCommentsReadCallback = null
    this.onErrorCallback = null
    this.onConnectCallback = null
    this.onDisconnectCallback = null

    if (this.socket) {
      this.socket.off('comment')
      this.socket.off('comment_edited')
      this.socket.off('comment_deleted')
      this.socket.off('comments_read')
      this.socket.off('error')
    }
  }
}

const taskCommentsSocket = new TaskCommentsSocketService()

export default taskCommentsSocket
