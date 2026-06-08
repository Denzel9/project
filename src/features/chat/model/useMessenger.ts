import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import {
  invalidateConversations,
  useConversationsQuery,
  useCreateConversationMutation,
  useMessagesQuery,
  type ChatMessage,
} from '@/entities/chat'
import { useAuthStore } from '@/features/auth'
import { ROUTES } from '@/shared/config/routes'
import chatSocket from '@/shared/api/socket'

const mergeMessages = (
  history: ChatMessage[],
  live: ChatMessage[],
): ChatMessage[] => {
  const map = new Map<string, ChatMessage>()

  for (const message of [...history, ...live]) {
    map.set(message.id, message)
  }

  return [...map.values()].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )
}

export const useMessenger = () => {
  const currentUserId = useAuthStore(state => state.id)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const recipientIdParam = searchParams.get('recipientId')

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([])
  const [socketError, setSocketError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const handledRecipientRef = useRef<string | null>(null)
  const selectedConversationIdRef = useRef<string | null>(null)

  selectedConversationIdRef.current = selectedConversationId

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversationsQuery()

  const {
    data: historyMessages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessagesQuery(selectedConversationId)

  const createConversation = useCreateConversationMutation()

  const selectedConversation = useMemo(
    () => conversations.find(c => c.id === selectedConversationId) ?? null,
    [conversations, selectedConversationId],
  )

  const messages = useMemo(
    () => mergeMessages(historyMessages, liveMessages),
    [historyMessages, liveMessages],
  )

  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId)
    setLiveMessages([])
    setSocketError(null)
    chatSocket.joinConversation(conversationId)
  }, [])

  useEffect(() => {
    chatSocket.connect()

    const handleMessage = (message: ChatMessage) => {
      invalidateConversations()

      setLiveMessages(prev => {
        if (prev.some(m => m.id === message.id)) {
          return prev
        }

        if (message.conversationId === selectedConversationIdRef.current) {
          return [...prev, message]
        }

        return prev
      })
    }

    const handleError = (error: { message: string }) => {
      setSocketError(error.message)
    }

    chatSocket.onMessage(handleMessage)
    chatSocket.onError(handleError)

    return () => {
      chatSocket.removeListeners()
      chatSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (selectedConversationId && chatSocket.isConnected()) {
      chatSocket.joinConversation(selectedConversationId)
    }
  }, [selectedConversationId])

  useEffect(() => {
    if (!recipientIdParam || handledRecipientRef.current === recipientIdParam) {
      return
    }

    handledRecipientRef.current = recipientIdParam

    const existing = conversations.find(c => c.peer.id === recipientIdParam)

    const openConversation = async () => {
      try {
        const conversation =
          existing ??
          (await createConversation.mutateAsync({
            recipientId: recipientIdParam,
          }))

        selectConversation(conversation.id)
        navigate(ROUTES.CHAT, { replace: true })
      } catch {
        setSocketError('Не удалось открыть диалог')
      }
    }

    if (!conversationsLoading) {
      void openConversation()
    }
  }, [
    recipientIdParam,
    conversations,
    conversationsLoading,
    createConversation,
    selectConversation,
    navigate,
  ])

  const sendMessage = useCallback(() => {
    const content = draft.trim()
    if (!content || !selectedConversationId) return

    chatSocket.sendMessage({ conversationId: selectedConversationId, content })
    setDraft('')
  }, [draft, selectedConversationId])

  const isLoading =
    conversationsLoading ||
    messagesLoading ||
    createConversation.isPending

  const error =
    socketError ??
    (conversationsError instanceof Error ? conversationsError.message : null) ??
    (messagesError instanceof Error ? messagesError.message : null)

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectConversation,
    messages,
    currentUserId,
    draft,
    setDraft,
    sendMessage,
    isLoading,
    error,
    isConnected: chatSocket.isConnected(),
  }
}
