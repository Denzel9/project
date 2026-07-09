import { io, type Socket } from 'socket.io-client'

import type { NotificationSocketEvent } from '@/entities/notification'

type SocketErrorPayload = {
  message: string
}

const getNotificationsSocketUrl = () => {
  const base = import.meta.env.VITE_API_URL_BACKEND as string
  return `${base.replace(/\/$/, '')}/notifications`
}

class NotificationsSocketService {
  private socket: Socket | null = null
  private onNotificationCallback:
    | ((event: NotificationSocketEvent) => void)
    | null = null
  private onErrorCallback: ((error: SocketErrorPayload) => void) | null = null
  private onConnectCallback: (() => void) | null = null
  private onDisconnectCallback: (() => void) | null = null

  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket
    }

    if (!this.socket) {
      this.socket = io(getNotificationsSocketUrl(), {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      this.socket.on('connect', () => {
        this.bindSocketEvents()
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

    this.socket.off('notification')
    this.socket.off('error')

    this.socket.on('notification', (event: NotificationSocketEvent) => {
      this.onNotificationCallback?.(event)
    })

    this.socket.on('error', (error: SocketErrorPayload) => {
      this.onErrorCallback?.(error)
    })
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

  onNotification(callback: (event: NotificationSocketEvent) => void) {
    this.onNotificationCallback = callback
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
    this.onNotificationCallback = null
    this.onErrorCallback = null
    this.onConnectCallback = null
    this.onDisconnectCallback = null

    if (this.socket) {
      this.socket.off('notification')
      this.socket.off('error')
      this.socket.off('connect')
      this.socket.off('disconnect')
    }
  }
}

const notificationsSocket = new NotificationsSocketService()

export default notificationsSocket
