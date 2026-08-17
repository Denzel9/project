import { useSyncExternalStore } from 'react'

export type ChatMessageWindowState = {
  hasOlder: boolean
  hasNewer: boolean
  detached: boolean
  initialized: boolean
}

const DEFAULT_WINDOW_STATE: ChatMessageWindowState = {
  hasOlder: false,
  hasNewer: false,
  detached: false,
  initialized: false,
}

const windows = new Map<string, ChatMessageWindowState>()
const listeners = new Set<() => void>()

const emit = () => {
  listeners.forEach(listener => listener())
}

export const getMessageWindowState = (
  conversationId: string | null,
): ChatMessageWindowState => {
  if (!conversationId) return DEFAULT_WINDOW_STATE

  return windows.get(conversationId) ?? DEFAULT_WINDOW_STATE
}

export const setMessageWindowState = (
  conversationId: string,
  patch: Partial<ChatMessageWindowState>,
) => {
  const previous = windows.get(conversationId) ?? DEFAULT_WINDOW_STATE
  windows.set(conversationId, {
    ...previous,
    ...patch,
    initialized: patch.initialized ?? true,
  })
  emit()
}

export const isMessageWindowDetached = (conversationId: string) =>
  Boolean(windows.get(conversationId)?.detached)

export const subscribeMessageWindowState = (listener: () => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const useMessageWindowState = (conversationId: string | null) =>
  useSyncExternalStore(subscribeMessageWindowState, () =>
    getMessageWindowState(conversationId),
  )
