import { useMediaQuery, useTheme } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import {
  appendMessageToCache,
  invalidateConversations,
  uploadConversationMediaBatch,
  useConversationsQuery,
  useCreateConversationMutation,
  useMessagesQuery,
  validateChatMediaFile,
  type ChatMessage,
} from '@/entities/chat'
import { useAuthStore } from '@/features/auth'
import chatSocket from '@/shared/api/socket'
import { ROUTES } from '@/shared/config/routes'

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

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response
      ?.data?.message === 'string'
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message
  }

  return null
}

export const useMessenger = () => {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isSendingMedia, setIsSendingMedia] = useState(false)
  const [isSocketConnected, setIsSocketConnected] = useState(false)

  const handledRecipientRef = useRef<string | null>(null)
  const selectedConversationIdRef = useRef<string | null>(null)

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId
  }, [selectedConversationId])

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
    setPendingFiles([])
    setSocketError(null)
    chatSocket.joinConversation(conversationId)
  }, [])

  useEffect(() => {
    chatSocket.connect()

    const handleMessage = (message: ChatMessage) => {
      const normalizedMessage = {
        ...message,
        media: message.media ?? [],
      }

      invalidateConversations()
      appendMessageToCache(queryClient, normalizedMessage.conversationId, normalizedMessage)

      setLiveMessages(prev => {
        if (prev.some(item => item.id === normalizedMessage.id)) {
          return prev
        }

        if (normalizedMessage.conversationId === selectedConversationIdRef.current) {
          return [...prev, normalizedMessage]
        }

        return prev
      })
    }

    const handleError = (error: { message: string }) => {
      setSocketError(error.message)
    }

    const handleConnect = () => {
      setIsSocketConnected(true)

      if (selectedConversationIdRef.current) {
        chatSocket.joinConversation(selectedConversationIdRef.current)
      }
    }

    const handleDisconnect = () => {
      setIsSocketConnected(false)
    }

    chatSocket.onMessage(handleMessage)
    chatSocket.onError(handleError)
    chatSocket.onConnect(handleConnect)
    chatSocket.onDisconnect(handleDisconnect)

    setTimeout(() => {
      setIsSocketConnected(chatSocket.isConnected())
    }, 0)

    return () => {
      chatSocket.removeListeners()
      chatSocket.disconnect()
    }
  }, [queryClient])

  useEffect(() => {
    if (
      isDesktop &&
      !selectedConversationId &&
      conversations.length > 0 &&
      !recipientIdParam
    ) {
      setTimeout(() => {
        selectConversation(conversations[0].id)
      }, 0)
    }
  }, [
    isDesktop,
    conversations,
    recipientIdParam,
    selectConversation,
    selectedConversationId,
  ])

  useEffect(() => {
    if (!recipientIdParam || handledRecipientRef.current === recipientIdParam) {
      return
    }

    if (conversationsLoading || createConversation.isPending) {
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
      } catch (error) {
        setSocketError(getErrorMessage(error) ?? 'Не удалось открыть диалог')
      }
    }

    void openConversation()
  }, [
    recipientIdParam,
    conversations,
    conversationsLoading,
    createConversation,
    selectConversation,
    navigate,
  ])

  const addPendingFiles = useCallback((files: File[]) => {
    const validFiles: File[] = []

    for (const file of files) {
      const validationError = validateChatMediaFile(file)

      if (validationError) {
        setSocketError(validationError)
        continue
      }

      validFiles.push(file)
    }

    if (!validFiles.length) return

    setPendingFiles(prev => [...prev, ...validFiles])
    setSocketError(null)
  }, [])

  const removePendingFile = useCallback((index: number) => {
    setPendingFiles(prev => prev.filter((_, fileIndex) => fileIndex !== index))
  }, [])

  const sendMessage = useCallback(async () => {
    const content = draft.trim()
    const hasContent = Boolean(content)
    const hasFiles = pendingFiles.length > 0

    if ((!hasContent && !hasFiles) || !selectedConversationId) {
      return
    }

    if (!isSocketConnected) {
      setSocketError('Нет соединения с чатом. Попробуйте ещё раз.')
      chatSocket.connect()
      return
    }

    try {
      setIsSendingMedia(true)
      setSocketError(null)

      const media = hasFiles
        ? await uploadConversationMediaBatch(
          selectedConversationId,
          pendingFiles,
        )
        : undefined

      chatSocket.sendMessage({
        conversationId: selectedConversationId,
        content: hasContent ? content : undefined,
        media,
      })

      setDraft('')
      setPendingFiles([])
    } catch (error) {
      setSocketError(getErrorMessage(error) ?? 'Не удалось отправить сообщение')
    } finally {
      setIsSendingMedia(false)
    }
  }, [
    draft,
    isSocketConnected,
    pendingFiles,
    selectedConversationId,
  ])

  const isOpeningConversation =
    Boolean(recipientIdParam) &&
    (createConversation.isPending ||
      conversationsLoading ||
      (!selectedConversationId && !socketError))

  const isLoading =
    conversationsLoading ||
    messagesLoading ||
    isOpeningConversation ||
    isSendingMedia

  const error =
    socketError ??
    getErrorMessage(conversationsError) ??
    getErrorMessage(messagesError)

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectConversation,
    messages,
    currentUserId,
    draft,
    setDraft,
    pendingFiles,
    addPendingFiles,
    removePendingFile,
    sendMessage,
    isSendingMedia,
    isLoading,
    isOpeningConversation,
    recipientIdParam,
    error,
    isConnected: isSocketConnected,
  }
}
