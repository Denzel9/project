import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import {
  appendMessageToCache,
  claimIncomingChatMessage,
  incrementConversationUnreadCount,
  shouldCountIncomingChatUnread,
  unlockConversationSendPermission,
  updateConversationLastMessage,
  type ChatMessage,
} from '@/entities/chat'
import { useAuthStore } from '@/features/auth'
import chatSocket from '@/shared/api/socket'

/**
 * Keeps chat unread counters fresh outside ChatPage:
 * listens on the user room for incoming messages (including replies).
 */
export const useChatUnreadRealtime = () => {
  const queryClient = useQueryClient()
  const isAuth = useAuthStore(state => state.isAuth)
  const userId = useAuthStore(state => state.id)

  useEffect(() => {
    if (!isAuth || !userId) {
      chatSocket.disconnect()
      return
    }

    chatSocket.connect()

    const handleMessage = (message: ChatMessage) => {
      if (!message?.id || message.senderId === userId) {
        return
      }

      appendMessageToCache(queryClient, message.conversationId, message)
      updateConversationLastMessage(
        queryClient,
        message.conversationId,
        message,
      )
      unlockConversationSendPermission(queryClient, message.conversationId)

      if (!shouldCountIncomingChatUnread(message.conversationId)) {
        claimIncomingChatMessage(message.id)
        return
      }

      if (claimIncomingChatMessage(message.id)) {
        incrementConversationUnreadCount(queryClient, message.conversationId)
      }
    }

    const unsubscribeMessage = chatSocket.onMessage(handleMessage)

    return () => {
      unsubscribeMessage()
    }
  }, [isAuth, userId, queryClient])
}
