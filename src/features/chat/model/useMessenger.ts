import { useMediaQuery, useTheme } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'

import {
  appendMessageToCache,
  applyMessagesReadInCache,
  chatKeys,
  claimIncomingChatMessage,
  getUnreadDividerMessageId,
  incrementConversationUnreadCount,
  markConversationReadInCache,
  removeMessageFromCache,
  setActiveChatConversationId,
  setChatUnreadHoldConversationId,
  setConversationUnreadCount,
  sortConversationsByUnread,
  unlockConversationSendPermission,
  updateConversationLastMessage,
  updateMessageInCache,
  uploadConversationMediaBatch,
  useConversationsQuery,
  useCreateConversationMutation,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useHideMessagesMutation,
  useMarkConversationReadMutation,
  useMarkConversationUnreadMutation,
  useMessagePinsQuery,
  useMessagesQuery,
  usePinMessageMutation,
  validateChatMediaFile,
  type ChatConversation,
  type ChatMessage,
  type ChatMessageMedia,
  type ChatMessagesHiddenEvent,
  type ChatPeer,
} from '@/entities/chat'
import { getUserName, useGetUserByIdQuery } from '@/entities/user'
import { useAuthStore } from '@/features/auth'
import chatSocket from '@/shared/api/socket'
import { ROUTES } from '@/shared/config/routes'

const CONNECTION_ERROR_MESSAGE =
  'Нет соединения с чатом. Попробуйте ещё раз.'

const isConnectionError = (message: string) => /соединени|connection/i.test(message)

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

const getForwardMessageError = (error: unknown) =>
  getErrorMessage(error) ?? 'Не удалось переслать сообщение'

const getEditMessageError = (error: unknown) => {
  const status =
    typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as { response?: { status?: number } }).response?.status ===
      'number'
      ? (error as { response: { status: number } }).response.status
      : null

  if (status === 403) {
    return 'Нельзя редактировать это сообщение'
  }

  if (status === 404) {
    return 'Сообщение не найдено'
  }

  if (status === 400) {
    return 'Текст не может быть пустым без вложений'
  }

  return getErrorMessage(error) ?? 'Не удалось изменить сообщение'
}

const normalizeIncomingMessage = (
  message: ChatMessage,
  overrides?: Partial<ChatMessage>,
): ChatMessage => ({
  ...message,
  media: message.media ?? [],
  editedAt: message.editedAt ?? null,
  isRedirected: message.isRedirected ?? false,
  isRead: message.isRead ?? false,
  replyToId: message.replyToId ?? null,
  replyToPreview: message.replyToPreview ?? null,
  replyToSenderId: message.replyToSenderId ?? null,
  replyToSenderName: message.replyToSenderName ?? null,
  redirectedFromUserId: message.redirectedFromUserId ?? null,
  redirectedFromDisplayName: message.redirectedFromDisplayName ?? null,
  actorAccountId: message.actorAccountId ?? null,
  actorDisplayName: message.actorDisplayName ?? null,
  actorKind: message.actorKind ?? null,
  ...overrides,
})

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
  const [pendingPeer, setPendingPeer] = useState<ChatPeer | null>(null)
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([])
  const [socketError, setSocketError] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isSendingMedia, setIsSendingMedia] = useState(false)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [isErrorDismissed, setIsErrorDismissed] = useState(false)
  const [unreadDividerMessageId, setUnreadDividerMessageId] = useState<
    string | null
  >(null)
  const [isForwardingMessage, setIsForwardingMessage] = useState(false)
  const [forwardingMessageId, setForwardingMessageId] = useState<string | null>(
    null,
  )
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [unreadHoldConversationId, setUnreadHoldConversationId] = useState<
    string | null
  >(null)

  const handledRecipientRef = useRef<string | null>(null)
  const selectedConversationIdRef = useRef<string | null>(null)
  const currentUserIdRef = useRef<string | null>(null)
  const prevRawErrorRef = useRef<string | null>(null)
  const openingUnreadCountRef = useRef(0)
  const openingUnreadAnchorRef = useRef<string | null>(null)
  const autoReadDoneForRef = useRef<string | null>(null)
  const unreadHoldConversationIdRef = useRef<string | null>(null)

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId
    setActiveChatConversationId(selectedConversationId)
    return () => {
      setActiveChatConversationId(null)
    }
  }, [selectedConversationId])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    unreadHoldConversationIdRef.current = unreadHoldConversationId
    setChatUnreadHoldConversationId(unreadHoldConversationId)
    return () => {
      setChatUnreadHoldConversationId(null)
    }
  }, [unreadHoldConversationId])

  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useConversationsQuery()

  const {
    data: historyMessages = [],
    isLoading: messagesLoading,
    error: messagesError,
  } = useMessagesQuery(selectedConversationId, {
    // Never mark read as a GET side-effect: open/hold logic owns read state.
    markRead: false,
  })

  const { data: pinnedMessages = [] } =
    useMessagePinsQuery(selectedConversationId)

  const createConversation = useCreateConversationMutation()
  const markConversationRead = useMarkConversationReadMutation()
  const markConversationUnread = useMarkConversationUnreadMutation()
  const deleteMessageMutation = useDeleteMessageMutation()
  const hideMessagesMutation = useHideMessagesMutation()
  const editMessageMutation = useEditMessageMutation()
  const pinMessageMutation = usePinMessageMutation()

  const recipientUserQuery = useGetUserByIdQuery(
    recipientIdParam &&
      !conversations.some(c => c.peer.id === recipientIdParam)
      ? recipientIdParam
      : null,
  )

  const selectedConversation = useMemo((): ChatConversation | null => {
    if (selectedConversationId) {
      return conversations.find(c => c.id === selectedConversationId) ?? null
    }

    if (pendingPeer) {
      return {
        id: '',
        peer: pendingPeer,
        lastMessage: null,
        unreadCount: 0,
        unreadAnchorMessageId: null,
        isMarkedUnread: false,
        isPinned: false,
        isNotes: false,
        updatedAt: new Date().toISOString(),
      }
    }

    return null
  }, [conversations, pendingPeer, selectedConversationId])

  const messages = useMemo(
    () => mergeMessages(historyMessages, liveMessages),
    [historyMessages, liveMessages],
  )

  const pinnedMessageIds = useMemo(
    () => new Set(pinnedMessages.map(pin => pin.messageId)),
    [pinnedMessages],
  )

  const pinnedByMessageId = useMemo(() => {
    const map = new Map<string, (typeof pinnedMessages)[number]>()

    pinnedMessages.forEach(pin => {
      map.set(pin.messageId, pin)
    })

    return map
  }, [pinnedMessages])

  const isMessagePinned = useCallback(
    (messageId: string) => pinnedMessageIds.has(messageId),
    [pinnedMessageIds],
  )

  const canUnpinMessage = useCallback(
    (messageId: string) => {
      const pin = pinnedByMessageId.get(messageId)

      if (!pin || !currentUserId) return false

      return pin.pinnedById === currentUserId
    },
    [currentUserId, pinnedByMessageId],
  )

  const clearReplyTo = useCallback(() => {
    setReplyToMessage(null)
  }, [])

  const setReplyTo = useCallback((message: ChatMessage) => {
    setReplyToMessage(message)
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const exitSelection = useCallback(() => {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }, [])

  const enterSelection = useCallback((messageId?: string) => {
    setReplyToMessage(null)
    setSelectionMode(true)
    setSelectedIds(messageId ? new Set([messageId]) : new Set())
  }, [])

  const toggleSelect = useCallback((messageId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)

      if (next.has(messageId)) {
        next.delete(messageId)
      } else {
        next.add(messageId)
      }

      return next
    })
  }, [])

  const onTogglePinMessage = useCallback(
    (
      messageId: string,
      nextPinned: boolean,
      scope?: 'PERSONAL' | 'SHARED',
    ) => {
      if (!selectedConversationId) return

      pinMessageMutation.mutate({
        conversationId: selectedConversationId,
        messageId,
        isPinned: nextPinned,
        ...(nextPinned && scope ? { scope } : {}),
      })
    },
    [pinMessageMutation, selectedConversationId],
  )

  const selectConversation = useCallback(
    (conversationId: string) => {
      const conversation = queryClient
        .getQueryData<ChatConversation[]>(chatKeys.conversations())
        ?.find(item => item.id === conversationId)

      openingUnreadCountRef.current = conversation?.unreadCount ?? 0
      openingUnreadAnchorRef.current =
        conversation?.unreadAnchorMessageId ?? null
      autoReadDoneForRef.current = null
      setUnreadHoldConversationId(null)
      setUnreadDividerMessageId(null)
      setPendingPeer(null)
      setSelectedConversationId(conversationId)
      setLiveMessages([])
      setPendingFiles([])
      setReplyToMessage(null)
      setSelectionMode(false)
      setSelectedIds(new Set())
      setSocketError(null)
      setIsErrorDismissed(false)
      chatSocket.joinConversation(conversationId)
    },
    [queryClient],
  )

  const openDraftChat = useCallback((peer: ChatPeer) => {
    openingUnreadCountRef.current = 0
    openingUnreadAnchorRef.current = null
    autoReadDoneForRef.current = null
    setUnreadHoldConversationId(null)
    setUnreadDividerMessageId(null)
    setSelectedConversationId(null)
    setPendingPeer(peer)
    setLiveMessages([])
    setPendingFiles([])
    setDraft('')
    setReplyToMessage(null)
    setSelectionMode(false)
    setSelectedIds(new Set())
    setSocketError(null)
    setIsErrorDismissed(false)
  }, [])

  const ensureConversationId = useCallback(async () => {
    if (selectedConversationId) {
      return selectedConversationId
    }

    if (!pendingPeer) {
      return null
    }

    const conversation = await createConversation.mutateAsync({
      recipientId: pendingPeer.id,
    })

    queryClient.setQueryData<ChatConversation[]>(
      chatKeys.conversations(),
      old => {
        if (!old) {
          return [conversation]
        }

        if (old.some(item => item.id === conversation.id)) {
          return old
        }

        return [conversation, ...old]
      },
    )

    setPendingPeer(null)
    setSelectedConversationId(conversation.id)
    chatSocket.joinConversation(conversation.id)
    return conversation.id
  }, [createConversation, pendingPeer, queryClient, selectedConversationId])

  useEffect(() => {
    if (!selectedConversationId || messagesLoading || !currentUserId) {
      return
    }

    const openingAnchorId = openingUnreadAnchorRef.current
    const openingUnreadCount = openingUnreadCountRef.current

    if (openingAnchorId && messages.some(message => message.id === openingAnchorId)) {
      setUnreadDividerMessageId(openingAnchorId)
      openingUnreadAnchorRef.current = null
      openingUnreadCountRef.current = 0
      return
    }

    if (openingUnreadCount > 0 && messages.length > 0) {
      setUnreadDividerMessageId(
        getUnreadDividerMessageId(
          messages,
          currentUserId,
          openingUnreadCount,
        ),
      )
      openingUnreadCountRef.current = 0
      openingUnreadAnchorRef.current = null
    }
  }, [selectedConversationId, messagesLoading, currentUserId, messages])

  useEffect(() => {
    if (!selectedConversationId || messagesLoading || !currentUserId) {
      return
    }

    if (unreadHoldConversationId === selectedConversationId) {
      return
    }

    if (autoReadDoneForRef.current === selectedConversationId) {
      return
    }

    autoReadDoneForRef.current = selectedConversationId

    markConversationReadInCache(
      queryClient,
      selectedConversationId,
      currentUserId,
    )

    if (isSocketConnected) {
      chatSocket.markRead(selectedConversationId)
    } else {
      markConversationRead.mutate(selectedConversationId)
    }
  }, [
    selectedConversationId,
    messagesLoading,
    currentUserId,
    isSocketConnected,
    queryClient,
    markConversationRead,
    unreadHoldConversationId,
  ])

  useEffect(() => {
    chatSocket.connect()

    const handleMessage = (message: ChatMessage) => {
      const userId = currentUserIdRef.current
      const activeConversationId = selectedConversationIdRef.current
      const isActiveConversation = message.conversationId === activeConversationId
      const isIncoming = Boolean(userId && message.senderId !== userId)

      const isUnreadHold =
        unreadHoldConversationIdRef.current === message.conversationId

      const normalizedMessage = normalizeIncomingMessage(message, {
        isRead:
          isActiveConversation && isIncoming && !isUnreadHold
            ? true
            : (message.isRead ?? false),
      })

      appendMessageToCache(
        queryClient,
        normalizedMessage.conversationId,
        normalizedMessage,
      )
      updateConversationLastMessage(
        queryClient,
        normalizedMessage.conversationId,
        normalizedMessage,
      )

      if (isIncoming) {
        unlockConversationSendPermission(
          queryClient,
          normalizedMessage.conversationId,
        )
      }

      if (isActiveConversation) {
        if (isIncoming && !isUnreadHold) {
          // Consume claim so global unread listener does not bump the counter
          claimIncomingChatMessage(normalizedMessage.id)
          chatSocket.markRead(normalizedMessage.conversationId)

          if (userId) {
            markConversationReadInCache(
              queryClient,
              normalizedMessage.conversationId,
              userId,
            )
          }
        }

        if (isIncoming && isUnreadHold) {
          if (claimIncomingChatMessage(normalizedMessage.id)) {
            incrementConversationUnreadCount(
              queryClient,
              normalizedMessage.conversationId,
            )
          }
        }

        setLiveMessages(prev => {
          if (prev.some(item => item.id === normalizedMessage.id)) {
            return prev
          }

          return [...prev, normalizedMessage]
        })

        return
      }

      if (isIncoming && claimIncomingChatMessage(normalizedMessage.id)) {
        incrementConversationUnreadCount(
          queryClient,
          normalizedMessage.conversationId,
        )
      }
    }

    const handleMessagesRead = (event: {
      conversationId: string
      userId: string
      readAt: string
    }) => {
      const userId = currentUserIdRef.current

      if (!userId || event.userId === userId) {
        return
      }

      applyMessagesReadInCache(
        queryClient,
        event.conversationId,
        event.readAt,
        userId,
      )

      const readAtTime = new Date(event.readAt).getTime()

      setLiveMessages(prev =>
        prev.map(message =>
          message.conversationId === event.conversationId &&
            message.senderId === userId &&
            new Date(message.createdAt).getTime() <= readAtTime
            ? { ...message, isRead: true }
            : message,
        ),
      )
    }

    const handleMessageDeleted = (event: {
      conversationId: string
      messageId: string
    }) => {
      removeMessageFromCache(
        queryClient,
        event.conversationId,
        event.messageId,
      )

      setLiveMessages(prev =>
        prev.filter(message => message.id !== event.messageId),
      )
      setSelectedIds(prev => {
        if (!prev.has(event.messageId)) return prev
        const next = new Set(prev)
        next.delete(event.messageId)
        return next
      })
    }

    const handleMessagesHidden = (event: ChatMessagesHiddenEvent) => {
      removeMessageFromCache(
        queryClient,
        event.conversationId,
        event.messageIds,
      )

      const hiddenIds = new Set(event.messageIds)

      setLiveMessages(prev =>
        prev.filter(message => !hiddenIds.has(message.id)),
      )
      setSelectedIds(prev => {
        if (![...hiddenIds].some(id => prev.has(id))) return prev
        const next = new Set(prev)
        for (const id of hiddenIds) {
          next.delete(id)
        }
        return next
      })
    }

    const handleMessageEdited = (message: ChatMessage) => {
      const normalizedMessage = normalizeIncomingMessage(message)

      updateMessageInCache(queryClient, normalizedMessage)

      const activeConversationId = selectedConversationIdRef.current

      if (normalizedMessage.conversationId === activeConversationId) {
        setLiveMessages(prev =>
          prev.map(item =>
            item.id === normalizedMessage.id ? normalizedMessage : item,
          ),
        )
      }
    }

    const handleError = (error: { message: string }) => {
      setSocketError(error.message)
    }

    const handleConnect = () => {
      setIsSocketConnected(true)
      setSocketError(prev => (prev && isConnectionError(prev) ? null : prev))

      if (selectedConversationIdRef.current) {
        chatSocket.joinConversation(selectedConversationIdRef.current)
      }
    }

    const handleDisconnect = () => {
      setIsSocketConnected(false)
      setSocketError(prev => {
        if (prev && !isConnectionError(prev)) {
          return prev
        }

        return CONNECTION_ERROR_MESSAGE
      })
    }

    const unsubscribeMessage = chatSocket.onMessage(handleMessage)
    chatSocket.onMessagesRead(handleMessagesRead)
    chatSocket.onMessageDeleted(handleMessageDeleted)
    chatSocket.onMessagesHidden(handleMessagesHidden)
    chatSocket.onMessageEdited(handleMessageEdited)
    chatSocket.onError(handleError)
    chatSocket.onConnect(handleConnect)
    chatSocket.onDisconnect(handleDisconnect)

    setTimeout(() => {
      setIsSocketConnected(chatSocket.isConnected())
    }, 0)

    return () => {
      unsubscribeMessage()
    }
  }, [queryClient, currentUserId])

  useEffect(() => {
    if (
      isDesktop &&
      !selectedConversationId &&
      !pendingPeer &&
      conversations.length > 0 &&
      !recipientIdParam
    ) {
      const firstConversation = sortConversationsByUnread(conversations)[0]

      if (!firstConversation?.id) return

      setTimeout(() => {
        selectConversation(firstConversation.id)
      }, 0)
    }
  }, [
    isDesktop,
    conversations,
    pendingPeer,
    recipientIdParam,
    selectConversation,
    selectedConversationId,
  ])

  useEffect(() => {
    if (!recipientIdParam || handledRecipientRef.current === recipientIdParam) {
      return
    }

    if (conversationsLoading) {
      return
    }

    const existing = conversations.find(c => c.peer.id === recipientIdParam)

    if (existing) {
      handledRecipientRef.current = recipientIdParam
      setTimeout(() => {
        selectConversation(existing.id)
      }, 0)
      navigate(ROUTES.CHAT, { replace: true })
      return
    }

    if (recipientUserQuery.isLoading || recipientUserQuery.isFetching) {
      return
    }

    handledRecipientRef.current = recipientIdParam

    const response = recipientUserQuery.data
    const user =
      response && typeof response === 'object' && 'data' in response
        ? response.data
        : response

    if (!user?.id) {
      setTimeout(() => {
        setSocketError('Не удалось открыть диалог')
      }, 0)
      navigate(ROUTES.CHAT, { replace: true })
      return
    }

    const role = user.role === 'COMPANY' ? 'COMPANY' : 'CREATOR'
    setTimeout(() => {
      openDraftChat({
        id: user.id,
        role,
        avatar: user.avatar ?? null,
        displayName: getUserName(user) || 'Пользователь',
      })
      navigate(ROUTES.CHAT, { replace: true })
    }, 0)
  }, [
    recipientIdParam,
    conversations,
    conversationsLoading,
    recipientUserQuery.isLoading,
    recipientUserQuery.isFetching,
    recipientUserQuery.data,
    selectConversation,
    openDraftChat,
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

  const sendTextMessage = useCallback(
    async (
      content: string,
      options?: { media?: ChatMessageMedia[]; replyToId?: string },
    ) => {
      const trimmed = content.trim()
      const media = options?.media

      if (
        (!trimmed && !media?.length) ||
        (!selectedConversationId && !pendingPeer)
      ) {
        return false
      }

      try {
        setIsSendingMedia(true)
        setSocketError(null)

        const conversationId = await ensureConversationId()
        if (!conversationId) {
          return false
        }

        chatSocket.connect()
        chatSocket.sendMessage({
          conversationId,
          content: trimmed || undefined,
          ...(media?.length ? { media } : {}),
          ...(options?.replyToId ? { replyToId: options.replyToId } : {}),
        })

        return true
      } catch (error) {
        setSocketError(
          getErrorMessage(error) ?? 'Не удалось отправить сообщение',
        )
        return false
      } finally {
        setIsSendingMedia(false)
      }
    },
    [ensureConversationId, pendingPeer, selectedConversationId],
  )

  const sendMessage = useCallback(async () => {
    const content = draft.trim()
    const hasContent = Boolean(content)
    const hasFiles = pendingFiles.length > 0

    if ((!hasContent && !hasFiles) || (!selectedConversationId && !pendingPeer)) {
      return
    }

    const conversation = conversations.find(
      item => item.id === selectedConversationId,
    )
    if (conversation && conversation.canSendMessages === false) {
      setSocketError(
        conversation.sendBlockedReason ??
          'Дождитесь первого сообщения от компании',
      )
      return
    }

    if (!isSocketConnected) {
      setSocketError(CONNECTION_ERROR_MESSAGE)
      chatSocket.connect()
      return
    }

    try {
      setIsSendingMedia(true)
      setSocketError(null)

      const conversationId = await ensureConversationId()
      if (!conversationId) {
        return
      }

      const media = hasFiles
        ? await uploadConversationMediaBatch(conversationId, pendingFiles)
        : undefined

      chatSocket.sendMessage({
        conversationId,
        content: hasContent ? content : undefined,
        media,
        ...(replyToMessage?.id ? { replyToId: replyToMessage.id } : {}),
      })

      setDraft('')
      setPendingFiles([])
      setReplyToMessage(null)
    } catch (error) {
      setSocketError(getErrorMessage(error) ?? 'Не удалось отправить сообщение')
    } finally {
      setIsSendingMedia(false)
    }
  }, [
    conversations,
    draft,
    ensureConversationId,
    isSocketConnected,
    pendingFiles,
    pendingPeer,
    replyToMessage,
    selectedConversationId,
  ])

  const clearError = useCallback(() => {
    setSocketError(null)
    setIsErrorDismissed(true)
  }, [])

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!selectedConversationId) {
        return
      }

      try {
        setSocketError(null)
        await deleteMessageMutation.mutateAsync({
          conversationId: selectedConversationId,
          messageId,
        })
        setLiveMessages(prev => prev.filter(message => message.id !== messageId))
        setSelectedIds(prev => {
          if (!prev.has(messageId)) return prev
          const next = new Set(prev)
          next.delete(messageId)
          return next
        })
      } catch (error) {
        setSocketError(getErrorMessage(error) ?? 'Не удалось удалить сообщение')
        setIsErrorDismissed(false)
      }
    },
    [deleteMessageMutation, selectedConversationId],
  )

  const hideMessagesSelected = useCallback(async () => {
    if (!selectedConversationId || selectedIds.size === 0) {
      return
    }

    const messageIds = [...selectedIds]

    try {
      setSocketError(null)
      await hideMessagesMutation.mutateAsync({
        conversationId: selectedConversationId,
        messageIds,
      })
      const hidden = new Set(messageIds)
      setLiveMessages(prev => prev.filter(message => !hidden.has(message.id)))
      exitSelection()
    } catch (error) {
      setSocketError(getErrorMessage(error) ?? 'Не удалось скрыть сообщения')
      setIsErrorDismissed(false)
    }
  }, [
    exitSelection,
    hideMessagesMutation,
    selectedConversationId,
    selectedIds,
  ])

  const markUnread = useCallback(
    async (messageId: string) => {
      if (!selectedConversationId || !currentUserId) {
        return
      }

      const conversationId = selectedConversationId

      try {
        setSocketError(null)
        // Hold until the next explicit open so auto-read cannot immediately
        // clear the unread state while still in this chat.
        setUnreadHoldConversationId(conversationId)
        autoReadDoneForRef.current = conversationId

        const result = await markConversationUnread.mutateAsync({
          conversationId,
          messageId,
        })

        setConversationUnreadCount(
          queryClient,
          conversationId,
          result.unreadCount,
          result.unreadAnchorMessageId,
        )
      } catch (error) {
        setUnreadHoldConversationId(prev =>
          prev === conversationId ? null : prev,
        )
        autoReadDoneForRef.current = null
        setSocketError(
          getErrorMessage(error) ?? 'Не удалось пометить как непрочитанное',
        )
        setIsErrorDismissed(false)
      }
    },
    [
      currentUserId,
      markConversationUnread,
      queryClient,
      selectedConversationId,
    ],
  )

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!selectedConversationId) {
        return false
      }

      try {
        setSocketError(null)
        const updatedMessage = await editMessageMutation.mutateAsync({
          conversationId: selectedConversationId,
          messageId,
          content,
        })

        setLiveMessages(prev =>
          prev.map(message =>
            message.id === updatedMessage.id ? updatedMessage : message,
          ),
        )

        return true
      } catch (error) {
        setSocketError(getEditMessageError(error))
        setIsErrorDismissed(false)
        return false
      }
    },
    [editMessageMutation, selectedConversationId],
  )

  const getForwardDisplayName = useCallback(
    (message: ChatMessage) => {
      if (message.actorDisplayName) {
        return message.actorDisplayName
      }

      if (message.redirectedFromDisplayName) {
        return message.redirectedFromDisplayName
      }

      if (currentUserId && message.senderId === currentUserId) {
        return 'Вы'
      }

      return selectedConversation?.peer.displayName ?? 'Пользователь'
    },
    [currentUserId, selectedConversation?.peer.displayName],
  )

  const forwardMessage = useCallback(
    async (messageIdOrIds: string | string[], targetPeerId: string) => {
      if (!selectedConversationId) {
        return { success: false, error: 'Чат не выбран' }
      }

      const messageIds = Array.isArray(messageIdOrIds)
        ? messageIdOrIds
        : [messageIdOrIds]

      if (!messageIds.length) {
        return { success: false, error: 'Сообщение не найдено' }
      }

      const messagesToForward = messageIds
        .map(id => messages.find(message => message.id === id))
        .filter((message): message is ChatMessage => Boolean(message))

      if (!messagesToForward.length) {
        return { success: false, error: 'Сообщение не найдено' }
      }

      if (!isSocketConnected) {
        const connectionError = CONNECTION_ERROR_MESSAGE
        setSocketError(connectionError)
        setIsErrorDismissed(false)
        chatSocket.connect()
        return { success: false, error: connectionError }
      }

      try {
        setIsForwardingMessage(true)
        setForwardingMessageId(messagesToForward[0].id)
        setSocketError(null)

        const existing = conversations.find(
          conversation => conversation.peer.id === targetPeerId,
        )
        const targetConversationId =
          existing?.id ??
          (
            await createConversation.mutateAsync({
              recipientId: targetPeerId,
            })
          ).id

        if (targetConversationId === selectedConversationId) {
          return { success: false, error: 'Нельзя переслать в этот же чат' }
        }

        chatSocket.joinConversation(targetConversationId)

        for (const messageToForward of messagesToForward) {
          const content = messageToForward.content
          const media = messageToForward.media ?? []
          const hasContent = Boolean(content.trim())
          const hasMedia = media.length > 0

          if (!hasContent && !hasMedia) {
            continue
          }

          chatSocket.sendMessage({
            conversationId: targetConversationId,
            ...(hasContent ? { content } : {}),
            ...(hasMedia ? { media } : {}),
            isRedirected: true,
            redirectedFromUserId: messageToForward.senderId,
            redirectedFromDisplayName: getForwardDisplayName(messageToForward),
          })
        }

        exitSelection()
        return { success: true }
      } catch (error) {
        const message = getForwardMessageError(error)
        setSocketError(message)
        setIsErrorDismissed(false)
        return { success: false, error: message }
      } finally {
        setIsForwardingMessage(false)
        setForwardingMessageId(null)
      }
    },
    [
      conversations,
      createConversation,
      exitSelection,
      getForwardDisplayName,
      isSocketConnected,
      messages,
      selectedConversationId,
    ],
  )

  const retryConnection = useCallback(() => {
    setSocketError(null)
    chatSocket.connect()

    if (selectedConversationIdRef.current) {
      chatSocket.joinConversation(selectedConversationIdRef.current)
    }
  }, [])

  const retryError = useCallback(() => {
    if (socketError && isConnectionError(socketError)) {
      retryConnection()
      return
    }

    if (socketError && /отправ/i.test(socketError)) {
      void sendMessage()
    }
  }, [retryConnection, sendMessage, socketError])

  const isOpeningConversation =
    Boolean(recipientIdParam) &&
    !pendingPeer &&
    !selectedConversationId &&
    !socketError &&
    (conversationsLoading ||
      recipientUserQuery.isLoading ||
      recipientUserQuery.isFetching)

  const isLoading =
    conversationsLoading ||
    messagesLoading ||
    isOpeningConversation ||
    isSendingMedia

  const rawError =
    socketError ??
    getErrorMessage(conversationsError) ??
    getErrorMessage(messagesError)

  useEffect(() => {
    if (rawError === prevRawErrorRef.current) {
      return
    }

    prevRawErrorRef.current = rawError

    if (rawError) {
      setTimeout(() => {
        setIsErrorDismissed(false)
      }, 0)
    }
  }, [rawError])

  const error = rawError && !isErrorDismissed ? rawError : null

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    selectConversation,
    openDraftChat,
    messages,
    pinnedMessages,
    isMessagePinned,
    canUnpinMessage,
    onTogglePinMessage,
    unreadDividerMessageId,
    currentUserId,
    draft,
    setDraft,
    pendingFiles,
    addPendingFiles,
    removePendingFile,
    sendMessage,
    sendTextMessage,
    deleteMessage,
    hideMessagesSelected,
    markUnread,
    editMessage,
    forwardMessage,
    replyToMessage,
    setReplyTo,
    clearReplyTo,
    selectionMode,
    selectedIds,
    enterSelection,
    toggleSelect,
    clearSelection,
    exitSelection,
    isDeletingMessage:
      deleteMessageMutation.isPending || hideMessagesMutation.isPending,
    deletingMessageId: deleteMessageMutation.isPending
      ? deleteMessageMutation.variables?.messageId ?? null
      : null,
    isHidingMessages: hideMessagesMutation.isPending,
    isEditingMessage: editMessageMutation.isPending,
    editingMessageId: editMessageMutation.isPending
      ? editMessageMutation.variables?.messageId ?? null
      : null,
    isForwardingMessage,
    forwardingMessageId,
    isSendingMedia,
    isLoading,
    isOpeningConversation,
    recipientIdParam,
    error,
    isConnected: isSocketConnected,
    clearError,
    retryConnection,
    retryError,
  }
}
