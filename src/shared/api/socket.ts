import { io, type Socket } from 'socket.io-client'

import type {
  ChatMessage,
  ChatMessageDeletedEvent,
  ChatMessageEditedEvent,
  ChatMessageMedia,
  ChatMessagesHiddenEvent,
  ChatMessagesReadEvent,
} from '@/entities/chat'

type SendMessagePayload = {
  conversationId: string
  content?: string
  media?: ChatMessageMedia[]
  isRedirected?: boolean
  replyToId?: string
  redirectedFromUserId?: string
  redirectedFromDisplayName?: string
}

type SocketErrorPayload = {
  message: string
}

const getChatSocketUrl = () => {
  const base = import.meta.env.VITE_API_URL_BACKEND as string
  return `${base.replace(/\/$/, '')}/chat`
}

class ChatSocketService {
  private socket: Socket | null = null
  private onMessageCallback: ((message: ChatMessage) => void) | null = null
  private onMessagesReadCallback:
    | ((event: ChatMessagesReadEvent) => void)
    | null = null
  private onMessageDeletedCallback:
    | ((event: ChatMessageDeletedEvent) => void)
    | null = null
  private onMessagesHiddenCallback:
    | ((event: ChatMessagesHiddenEvent) => void)
    | null = null
  private onMessageEditedCallback:
    | ((message: ChatMessageEditedEvent) => void)
    | null = null
  private onErrorCallback: ((error: SocketErrorPayload) => void) | null = null
  private onConnectCallback: (() => void) | null = null
  private onDisconnectCallback: (() => void) | null = null
  private pendingConversationId: string | null = null

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket
    }

    if (!this.socket) {
      this.socket = io(getChatSocketUrl(), {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      this.socket.on('connect', () => {
        this.bindSocketEvents()

        if (this.pendingConversationId) {
          this.emitJoinConversation(this.pendingConversationId)
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

    this.socket.off('message')
    this.socket.off('messages_read')
    this.socket.off('message_deleted')
    this.socket.off('messages_hidden')
    this.socket.off('message_edited')
    this.socket.off('error')

    this.socket.on('message', (message: ChatMessage) => {
      this.onMessageCallback?.(message)
    })

    this.socket.on('messages_read', (event: ChatMessagesReadEvent) => {
      this.onMessagesReadCallback?.(event)
    })

    this.socket.on('message_deleted', (event: ChatMessageDeletedEvent) => {
      this.onMessageDeletedCallback?.(event)
    })

    this.socket.on('messages_hidden', (event: ChatMessagesHiddenEvent) => {
      this.onMessagesHiddenCallback?.(event)
    })

    this.socket.on('message_edited', (message: ChatMessageEditedEvent) => {
      this.onMessageEditedCallback?.(message)
    })

    this.socket.on('error', (error: SocketErrorPayload) => {
      this.onErrorCallback?.(error)
    })
  }

  private emitJoinConversation(conversationId: string) {
    this.socket?.emit('join_conversation', { conversationId })
  }

  joinConversation(conversationId: string): void {
    this.pendingConversationId = conversationId
    this.connect()

    if (this.socket?.connected) {
      this.emitJoinConversation(conversationId)
    }
  }

  markRead(conversationId: string): void {
    this.connect()

    const emit = () => {
      this.socket?.emit('mark_read', { conversationId })
    }

    if (this.socket?.connected) {
      emit()
      return
    }

    this.socket?.once('connect', emit)
  }

  sendMessage(payload: SendMessagePayload): void {
    const hasContent = Boolean(payload.content?.trim())
    const hasMedia = Boolean(payload.media?.length)

    if (!hasContent && !hasMedia) {
      return
    }

    this.connect()

    const emit = () => {
      this.socket?.emit('send_message', {
        conversationId: payload.conversationId,
        ...(hasContent ? { content: payload.content!.trim() } : {}),
        ...(hasMedia ? { media: payload.media } : {}),
        ...(payload.isRedirected ? { isRedirected: true } : {}),
        ...(payload.replyToId ? { replyToId: payload.replyToId } : {}),
        ...(payload.redirectedFromUserId
          ? { redirectedFromUserId: payload.redirectedFromUserId }
          : {}),
        ...(payload.redirectedFromDisplayName
          ? { redirectedFromDisplayName: payload.redirectedFromDisplayName }
          : {}),
      })
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

    this.pendingConversationId = null
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.onMessageCallback = callback
  }

  onMessagesRead(callback: (event: ChatMessagesReadEvent) => void) {
    this.onMessagesReadCallback = callback
  }

  onMessageDeleted(callback: (event: ChatMessageDeletedEvent) => void) {
    this.onMessageDeletedCallback = callback
  }

  onMessagesHidden(callback: (event: ChatMessagesHiddenEvent) => void) {
    this.onMessagesHiddenCallback = callback
  }

  onMessageEdited(callback: (message: ChatMessageEditedEvent) => void) {
    this.onMessageEditedCallback = callback
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
    this.onMessageCallback = null
    this.onMessagesReadCallback = null
    this.onMessageDeletedCallback = null
    this.onMessagesHiddenCallback = null
    this.onMessageEditedCallback = null
    this.onErrorCallback = null
    this.onConnectCallback = null
    this.onDisconnectCallback = null

    if (this.socket) {
      this.socket.off('message')
      this.socket.off('messages_read')
      this.socket.off('message_deleted')
      this.socket.off('messages_hidden')
      this.socket.off('message_edited')
      this.socket.off('error')
      this.socket.off('connect')
      this.socket.off('disconnect')
    }
  }
}

const chatSocket = new ChatSocketService()

export default chatSocket
