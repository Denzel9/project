import { io, type Socket } from 'socket.io-client'

import type { ChatMessage } from '@/entities/chat'

type SendMessagePayload = {
  conversationId: string
  content: string
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
  private onErrorCallback: ((error: SocketErrorPayload) => void) | null = null

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket
    }

    const token = localStorage.getItem('token')

    this.socket = io(getChatSocketUrl(), {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      ...(token ? { auth: { token } } : {}),
    })

    this.setupEventListeners()

    return this.socket
  }

  private setupEventListeners() {
    if (!this.socket) return

    this.socket.off('message')
    this.socket.off('error')

    this.socket.on('message', (message: ChatMessage) => {
      this.onMessageCallback?.(message)
    })

    this.socket.on('error', (error: SocketErrorPayload) => {
      this.onErrorCallback?.(error)
    })
  }

  joinConversation(conversationId: string): void {
    if (!this.socket?.connected) {
      console.error('Chat socket not connected')
      return
    }

    this.socket.emit('join_conversation', { conversationId })
  }

  sendMessage(payload: SendMessagePayload): void {
    if (!this.socket?.connected) {
      console.error('Chat socket not connected')
      return
    }

    this.socket.emit('send_message', payload)
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.onMessageCallback = callback
  }

  onError(callback: (error: SocketErrorPayload) => void) {
    this.onErrorCallback = callback
  }

  removeListeners() {
    this.onMessageCallback = null
    this.onErrorCallback = null
    if (this.socket) {
      this.socket.off('message')
      this.socket.off('error')
    }
  }
}

const chatSocket = new ChatSocketService()

export default chatSocket
