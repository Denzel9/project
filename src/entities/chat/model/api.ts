import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { mainAxios, queryClient } from '@/shared/api'
import {
  mapInBatches,
  MEDIA_UPLOAD_CONCURRENCY,
  prepareFileForUpload,
} from '@/shared/lib/media'

import { toChatMessageMedia, sortConversationsByUnread } from './utils'
import {
  getMessageWindowState,
  isMessageWindowDetached,
  setMessageWindowState,
} from './messageWindowState'

import type {
  AttachmentsParams,
  ChatAttachment,
  ChatConversation,
  ChatMessage,
  ChatMessagePin,
  ChatMessagePinScope,
  ChatMessageMedia,
  ChatPeer,
  ChatPresenceEvent,
  ChatUnreadCount,
  ConversationsParams,
  CreateConversationDto,
  PaginatedResponse,
  PatchChatMessageDto,
  SearchMessagesParams,
} from './types'
import type { UploadMediaResponse } from '@/entities/post'

export {
  toChatMessageMedia,
  validateChatMediaFile,
  CHAT_MEDIA_ACCEPT,
  getMessagePreview,
  getUnreadDividerMessageId,
  isMessageDeletable,
  isMessageEditable,
  MESSAGE_DELETE_WINDOW_MS,
  sortConversationsByUnread,
  formatPeerPresenceLabel,
} from './utils'

export const chatKeys = {
  all: ['chat'] as const,
  unreadCount: () => [...chatKeys.all, 'unreadCount'] as const,
  conversationsRoot: () => [...chatKeys.all, 'conversations'] as const,
  conversations: (params?: ConversationsParams) =>
    [...chatKeys.conversationsRoot(), params ?? {}] as const,
  messagePins: (conversationId: string) =>
    [...chatKeys.all, 'messagePins', conversationId] as const,
  messages: (conversationId: string, cursor?: string, markRead?: boolean) =>
    [
      ...chatKeys.all,
      'messages',
      conversationId,
      cursor ?? '',
      markRead ?? 'default',
    ] as const,
  searchMessages: (
    conversationId: string,
    q: string,
    page: number,
    limit: number,
  ) =>
    [...chatKeys.all, 'search', conversationId, q, page, limit] as const,
  attachments: (conversationId: string, params: AttachmentsParams) =>
    [...chatKeys.all, 'attachments', conversationId, params] as const,
}

const messagesQueryFilter = (conversationId: string) => ({
  predicate: (query: { queryKey: readonly unknown[] }) =>
    query.queryKey[0] === chatKeys.all[0] &&
    query.queryKey[1] === 'messages' &&
    query.queryKey[2] === conversationId,
})

const conversationsQueryFilter = {
  predicate: (query: { queryKey: readonly unknown[] }) =>
    query.queryKey[0] === chatKeys.all[0] &&
    query.queryKey[1] === 'conversations',
}

const updateConversationsCache = (
  client: QueryClient,
  updater: (old: ChatConversation[] | undefined) => ChatConversation[] | undefined,
) => {
  client.setQueriesData<ChatConversation[]>(conversationsQueryFilter, updater)
}

const getConversationUnreadFromCache = (
  client: QueryClient,
  conversationId: string,
): number | null => {
  const entries = client.getQueriesData<ChatConversation[]>(
    conversationsQueryFilter,
  )

  for (const [, conversations] of entries) {
    const found = conversations?.find(item => item.id === conversationId)
    if (found) {
      return found.unreadCount ?? 0
    }
  }

  return null
}

export const setChatUnreadCountInCache = (
  client: QueryClient,
  count: number,
) => {
  client.setQueryData<ChatUnreadCount>(chatKeys.unreadCount(), {
    count: Math.max(0, count),
  })
}

const adjustChatUnreadCountInCache = (client: QueryClient, delta: number) => {
  const current = client.getQueryData<ChatUnreadCount>(chatKeys.unreadCount())

  if (!current) {
    void client.invalidateQueries({ queryKey: chatKeys.unreadCount() })
    return
  }

  setChatUnreadCountInCache(client, current.count + delta)
}

export const MESSAGES_PAGE_LIMIT = 50

export type ChatMessagesPage = {
  items: ChatMessage[]
  hasOlder: boolean
  hasNewer: boolean
}

export type FetchConversationMessagesOptions = {
  cursor?: string
  around?: string
  after?: string
  limit?: number
  markRead?: boolean
}

const sortMessages = (messages: ChatMessage[]) =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

const isChatMessageOlder = (message: ChatMessage, than: ChatMessage) => {
  const left = new Date(message.createdAt).getTime()
  const right = new Date(than.createdAt).getTime()

  if (left !== right) return left < right

  return message.id < than.id
}

const mergeUniqueMessages = (messages: ChatMessage[]) => {
  const byId = new Map<string, ChatMessage>()

  for (const message of messages) {
    byId.set(message.id, message)
  }

  return sortMessages([...byId.values()])
}

const normalizeMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  media: message.media ?? [],
  isRead: message.isRead ?? false,
  editedAt: message.editedAt ?? null,
  isRedirected: message.isRedirected ?? false,
  actorAccountId: message.actorAccountId ?? null,
  actorDisplayName: message.actorDisplayName ?? null,
  actorKind: message.actorKind ?? null,
  replyToId: message.replyToId ?? null,
  replyToPreview: message.replyToPreview ?? null,
  replyToSenderId: message.replyToSenderId ?? null,
  replyToSenderName: message.replyToSenderName ?? null,
  redirectedFromUserId: message.redirectedFromUserId ?? null,
  redirectedFromDisplayName: message.redirectedFromDisplayName ?? null,
})

const normalizePeer = (peer: ChatPeer): ChatPeer => ({
  ...peer,
  isOnline: peer.isOnline ?? false,
  lastSeenAt: peer.lastSeenAt ?? null,
})

const normalizeConversation = (conversation: ChatConversation): ChatConversation => {
  const isNotes = conversation.isNotes ?? false

  return {
    ...conversation,
    unreadCount: conversation.unreadCount ?? 0,
    unreadAnchorMessageId: conversation.unreadAnchorMessageId ?? null,
    isMarkedUnread: conversation.isMarkedUnread ?? false,
    isPinned: conversation.isPinned ?? false,
    isNotes,
    canSendMessages: conversation.canSendMessages ?? true,
    sendBlockedReason: conversation.sendBlockedReason ?? null,
    peer: isNotes
      ? { ...normalizePeer(conversation.peer), displayName: 'Заметки' }
      : normalizePeer(conversation.peer),
    lastMessage: conversation.lastMessage
      ? normalizeMessage(conversation.lastMessage)
      : null,
  }
}

const parseMessagesPage = (
  data: ChatMessage[] | ChatMessagesPage,
  options?: FetchConversationMessagesOptions,
): ChatMessagesPage => {
  if (Array.isArray(data)) {
    const items = sortMessages(data.map(normalizeMessage))

    return {
      items,
      hasOlder: items.length >= (options?.limit ?? MESSAGES_PAGE_LIMIT),
      hasNewer: Boolean(options?.cursor || options?.around),
    }
  }

  return {
    items: sortMessages((data.items ?? []).map(normalizeMessage)),
    hasOlder: Boolean(data.hasOlder),
    hasNewer: Boolean(data.hasNewer),
  }
}

export const fetchConversationMessages = async (
  conversationId: string,
  options?: FetchConversationMessagesOptions,
): Promise<ChatMessagesPage> => {
  const hasWindowParam = Boolean(options?.cursor || options?.around || options?.after)
  const markRead = options?.markRead ?? !hasWindowParam
  const { data } = await mainAxios.get<ChatMessage[] | ChatMessagesPage>(
    `/chat/conversations/${conversationId}/messages`,
    {
      params: {
        ...(options?.cursor ? { cursor: options.cursor } : {}),
        ...(options?.around ? { around: options.around } : {}),
        ...(options?.after ? { after: options.after } : {}),
        limit: options?.limit ?? MESSAGES_PAGE_LIMIT,
        markRead,
      },
    },
  )

  return parseMessagesPage(data, options)
}

export const getCachedConversationMessages = (
  client: QueryClient,
  conversationId: string,
) => {
  const entries = client.getQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
  )

  for (const [, messages] of entries) {
    if (messages?.length) return messages
  }

  return []
}

export const replaceMessagesInCache = (
  client: QueryClient,
  conversationId: string,
  messages: ChatMessage[],
) => {
  const next = sortMessages(messages.map(normalizeMessage))

  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
    () => next,
  )
  client.setQueryData<ChatMessage[]>(
    chatKeys.messages(conversationId, undefined, true),
    next,
  )
  client.setQueryData<ChatMessage[]>(
    chatKeys.messages(conversationId, undefined, false),
    next,
  )
}

export const prependMessagesToCache = (
  client: QueryClient,
  conversationId: string,
  messages: ChatMessage[],
) => {
  if (!messages.length) return

  const updater = (old: ChatMessage[] | undefined) =>
    mergeUniqueMessages([
      ...messages.map(normalizeMessage),
      ...(old ?? []),
    ])

  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
    updater,
  )
}

export const appendMessagesToCache = (
  client: QueryClient,
  conversationId: string,
  messages: ChatMessage[],
) => {
  if (!messages.length) return

  const updater = (old: ChatMessage[] | undefined) =>
    mergeUniqueMessages([
      ...(old ?? []),
      ...messages.map(normalizeMessage),
    ])

  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
    updater,
  )
}

export const appendMessageToCache = (
  client: QueryClient,
  conversationId: string,
  message: ChatMessage,
) => {
  if (isMessageWindowDetached(conversationId)) return

  const normalizedMessage = normalizeMessage(message)
  const updater = (old: ChatMessage[] | undefined) => {
    if (!old?.length) return [normalizedMessage]

    if (old.some(item => item.id === normalizedMessage.id)) {
      return old
    }

    return sortMessages([...old, normalizedMessage])
  }

  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
    updater,
  )
  // Default key used by useMessagesQuery — created even if dialog was never opened
  client.setQueryData<ChatMessage[]>(
    chatKeys.messages(conversationId, undefined, true),
    updater,
  )
}

export const setConversationUnreadCount = (
  client: QueryClient,
  conversationId: string,
  unreadCount: number,
  unreadAnchorMessageId?: string | null,
) => {
  const previous = getConversationUnreadFromCache(client, conversationId)

  updateConversationsCache(client, old =>
    old?.map(conversation =>
      conversation.id === conversationId
        ? {
            ...conversation,
            unreadCount,
            isMarkedUnread: unreadCount > 0 ? false : conversation.isMarkedUnread,
            ...(unreadAnchorMessageId !== undefined
              ? { unreadAnchorMessageId }
              : {}),
          }
        : conversation,
    ),
  )

  if (previous === null) {
    void client.invalidateQueries({ queryKey: chatKeys.unreadCount() })
    return
  }

  adjustChatUnreadCountInCache(client, unreadCount - previous)
}

export const incrementConversationUnreadCount = (
  client: QueryClient,
  conversationId: string,
) => {
  updateConversationsCache(client, old =>
    old?.map(conversation =>
      conversation.id === conversationId
        ? {
            ...conversation,
            unreadCount: (conversation.unreadCount ?? 0) + 1,
          }
        : conversation,
    ),
  )

  adjustChatUnreadCountInCache(client, 1)
}

export const updateConversationLastMessage = (
  client: QueryClient,
  conversationId: string,
  message: ChatMessage,
) => {
  const exists = client
    .getQueriesData<ChatConversation[]>(conversationsQueryFilter)
    .some(([, list]) => list?.some(item => item.id === conversationId))

  if (!exists) {
    void client.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
    void client.invalidateQueries({ queryKey: chatKeys.unreadCount() })
    return
  }

  updateConversationsCache(client, old =>
    old?.map(conversation =>
      conversation.id === conversationId
        ? {
            ...conversation,
            lastMessage: normalizeMessage(message),
            updatedAt: message.createdAt,
          }
        : conversation,
    ),
  )
}

export const applyPeerPresenceInCache = (
  client: QueryClient,
  event: ChatPresenceEvent,
) => {
  updateConversationsCache(client, old =>
    old?.map(conversation =>
      conversation.peer.id === event.userId
        ? {
            ...conversation,
            peer: {
              ...conversation.peer,
              isOnline: event.isOnline,
              lastSeenAt: event.lastSeenAt,
            },
          }
        : conversation,
    ),
  )
}

/** После первого сообщения компании исполнитель снова может писать. */
export const unlockConversationSendPermission = (
  client: QueryClient,
  conversationId: string,
) => {
  updateConversationsCache(client, old =>
    old?.map(conversation =>
      conversation.id === conversationId
        ? {
            ...conversation,
            canSendMessages: true,
            sendBlockedReason: null,
          }
        : conversation,
    ),
  )
}

export const applyMessagesReadInCache = (
  client: QueryClient,
  conversationId: string,
  readAt: string,
  currentUserId: string,
) => {
  const readAtTime = new Date(readAt).getTime()

  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
    old =>
      old?.map(message =>
        message.senderId === currentUserId &&
        new Date(message.createdAt).getTime() <= readAtTime
          ? { ...message, isRead: true }
          : message,
      ),
  )

  updateConversationsCache(client, old =>
    old?.map(conversation => {
      if (conversation.id !== conversationId) {
        return conversation
      }

      const lastMessage = conversation.lastMessage

      if (
        !lastMessage ||
        lastMessage.senderId !== currentUserId ||
        new Date(lastMessage.createdAt).getTime() > readAtTime
      ) {
        return conversation
      }

      return {
        ...conversation,
        lastMessage: { ...lastMessage, isRead: true },
      }
    }),
  )
}

export const markConversationReadInCache = (
  client: QueryClient,
  conversationId: string,
  currentUserId: string,
) => {
  const previous = getConversationUnreadFromCache(client, conversationId) ?? 0
  const wasMarkedOnly = (() => {
    const entries = client.getQueriesData<ChatConversation[]>(
      conversationsQueryFilter,
    )

    for (const [, conversations] of entries) {
      const found = conversations?.find(item => item.id === conversationId)
      if (found) {
        return (
          (found.unreadCount ?? 0) === 0 && Boolean(found.isMarkedUnread)
        )
      }
    }

    return false
  })()

  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
    old =>
      old?.map(message =>
        message.senderId !== currentUserId
          ? { ...message, isRead: true }
          : message,
      ),
  )

  updateConversationsCache(client, old =>
    old?.map(conversation => {
      if (conversation.id !== conversationId) {
        return conversation
      }

      const lastMessage = conversation.lastMessage

      return {
        ...conversation,
        unreadCount: 0,
        unreadAnchorMessageId: null,
        isMarkedUnread: false,
        lastMessage:
          lastMessage && lastMessage.senderId !== currentUserId
            ? { ...lastMessage, isRead: true }
            : lastMessage,
      }
    }),
  )

  if (previous > 0) {
    adjustChatUnreadCountInCache(client, -previous)
  } else if (wasMarkedOnly) {
    adjustChatUnreadCountInCache(client, -1)
  }
}

export const removeMessageFromCache = (
  client: QueryClient,
  conversationId: string,
  messageIds: string | string[],
) => {
  const ids = new Set(
    Array.isArray(messageIds) ? messageIds : [messageIds],
  )

  if (!ids.size) return

  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
    old => old?.filter(message => !ids.has(message.id)),
  )

  const cachedMessagesEntry = client
    .getQueriesData<ChatMessage[]>({
      ...messagesQueryFilter(conversationId),
    })
    .find(([, messages]) => Boolean(messages?.length))

  const nextLastMessage = cachedMessagesEntry?.[1]?.at(-1) ?? null

  updateConversationsCache(client, old =>
    old?.map(conversation => {
      if (conversation.id !== conversationId) {
        return conversation
      }

      if (
        !conversation.lastMessage ||
        !ids.has(conversation.lastMessage.id)
      ) {
        return conversation
      }

      return {
        ...conversation,
        lastMessage: nextLastMessage
          ? normalizeMessage(nextLastMessage)
          : null,
        updatedAt: nextLastMessage?.createdAt ?? conversation.updatedAt,
      }
    }),
  )
}

export const updateMessageInCache = (
  client: QueryClient,
  message: ChatMessage,
) => {
  const normalizedMessage = normalizeMessage(message)

  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(message.conversationId),
    old =>
      old?.map(item =>
        item.id === normalizedMessage.id ? normalizedMessage : item,
      ),
  )

  updateConversationsCache(client, old =>
    old?.map(conversation => {
      if (conversation.id !== message.conversationId) {
        return conversation
      }

      if (conversation.lastMessage?.id !== normalizedMessage.id) {
        return conversation
      }

      return {
        ...conversation,
        lastMessage: normalizedMessage,
      }
    }),
  )
}

export const patchChatMessage = async (
  conversationId: string,
  messageId: string,
  body: PatchChatMessageDto,
) => {
  const { data } = await mainAxios.patch<ChatMessage>(
    `/chat/conversations/${conversationId}/messages/${messageId}`,
    body,
  )

  return normalizeMessage(data)
}

export const fetchNotesConversation = async () => {
  const { data } = await mainAxios.get<ChatConversation>('/chat/notes')
  return normalizeConversation({
    ...data,
    isNotes: true,
    peer: {
      ...data.peer,
      displayName: 'Заметки',
    },
  })
}

const ensureNotesInConversations = async (
  conversations: ChatConversation[],
) => {
  if (conversations.some(item => item.isNotes)) {
    return conversations
  }

  try {
    const notes = await fetchNotesConversation()

    if (conversations.some(item => item.id === notes.id)) {
      return conversations.map(item =>
        item.id === notes.id ? { ...item, isNotes: true } : item,
      )
    }

    return [notes, ...conversations]
  } catch {
    return conversations
  }
}

export const useConversationsQuery = (
  params?: ConversationsParams,
  options?: { enabled?: boolean },
) => {
  const queryParams: ConversationsParams = {
    ...(params?.q && { q: params.q }),
    ...(params?.peerId && { peerId: params.peerId }),
  }

  return useQuery({
    queryKey: chatKeys.conversations(queryParams),
    queryFn: async () => {
      const { data } = await mainAxios.get<ChatConversation[]>(
        '/chat/conversations',
        { params: queryParams },
      )
      const normalized = data.map(normalizeConversation)
      const withNotes = await ensureNotesInConversations(normalized)
      return sortConversationsByUnread(withNotes)
    },
    enabled: options?.enabled ?? true,
  })
}

export const useNotesConversationQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: [...chatKeys.all, 'notes'] as const,
    queryFn: fetchNotesConversation,
    enabled: options?.enabled ?? true,
  })

export const useChatUnreadCountQuery = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: async () => {
      const { data } = await mainAxios.get<ChatUnreadCount>(
        '/chat/unread-count',
      )
      return data
    },
    enabled: options?.enabled ?? true,
  })

export const useMessagesQuery = (
  conversationId: string | null,
  options?: { cursor?: string; limit?: number; markRead?: boolean },
) => {
  const queryClient = useQueryClient()
  const markRead = options?.markRead ?? !options?.cursor
  const limit = options?.limit ?? MESSAGES_PAGE_LIMIT

  return useQuery({
    queryKey: chatKeys.messages(
      conversationId ?? '',
      options?.cursor,
      markRead,
    ),
    queryFn: async () => {
      if (isMessageWindowDetached(conversationId!)) {
        return getCachedConversationMessages(queryClient, conversationId!)
      }

      const page = await fetchConversationMessages(conversationId!, {
        cursor: options?.cursor,
        limit,
        markRead,
      })

      if (isMessageWindowDetached(conversationId!)) {
        return getCachedConversationMessages(queryClient, conversationId!)
      }

      if (!options?.cursor && !getMessageWindowState(conversationId!).initialized) {
        setMessageWindowState(conversationId!, {
          hasOlder: page.hasOlder,
          hasNewer: page.hasNewer,
          detached: page.hasNewer,
        })
      }

      if (options?.cursor || !page.items.length) {
        return page.items
      }

      const cached = queryClient.getQueryData<ChatMessage[]>(
        chatKeys.messages(conversationId!, options?.cursor, markRead),
      )

      if (!cached?.length) {
        return page.items
      }

      const oldestFetched = page.items[0]
      const olderKept = cached.filter(message =>
        isChatMessageOlder(message, oldestFetched),
      )

      return mergeUniqueMessages([...olderKept, ...page.items])
    },
    enabled: Boolean(conversationId),
  })
}

export const useMessagePinsQuery = (conversationId: string | null) => {
  return useQuery({
    queryKey: chatKeys.messagePins(conversationId ?? ''),
    queryFn: async () => {
      const { data } = await mainAxios.get<ChatMessagePin[]>(
        `/chat/conversations/${conversationId}/messages/pins`,
        {
          params: { limit: 50 },
        },
      )

      return data
    },
    enabled: Boolean(conversationId),
  })
}

export const usePinMessageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageId,
      isPinned,
      scope,
    }: {
      conversationId: string
      messageId: string
      isPinned: boolean
      scope?: ChatMessagePinScope
    }) => {
      await mainAxios.patch(
        `/chat/conversations/${conversationId}/messages/${messageId}/pin`,
        {
          isPinned,
          ...(isPinned && scope ? { scope } : {}),
        },
      )
    },
    onSuccess: (_data, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messagePins(conversationId),
      })
    },
  })
}

export const useMarkConversationReadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await mainAxios.post(`/chat/conversations/${conversationId}/read`)
    },
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      })
    },
  })
}

export const useMarkConversationUnreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageId,
    }: {
      conversationId: string
      messageId: string
    }) => {
      const { data } = await mainAxios.post<{
        conversationId: string
        lastReadAt: string | null
        unreadAnchorMessageId: string
        unreadCount: number
      }>(`/chat/conversations/${conversationId}/mark-unread`, { messageId })

      return data
    },
    onSuccess: data => {
      setConversationUnreadCount(
        queryClient,
        data.conversationId,
        data.unreadCount,
        data.unreadAnchorMessageId,
      )
      queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
    },
  })
}

export const useMarkConversationDialogUnreadMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const { data } = await mainAxios.post<{
        conversationId: string
        isMarkedUnread: boolean
        unreadCount: number
      }>(`/chat/conversations/${conversationId}/mark-dialog-unread`)

      return data
    },
    onSuccess: data => {
      updateConversationsCache(queryClient, old =>
        old?.map(conversation =>
          conversation.id === data.conversationId
            ? {
                ...conversation,
                isMarkedUnread: true,
                unreadAnchorMessageId: null,
                unreadCount: data.unreadCount,
              }
            : conversation,
        ),
      )
      adjustChatUnreadCountInCache(queryClient, 1)
      queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
    },
  })
}

export const useHideMessagesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageIds,
    }: {
      conversationId: string
      messageIds: string[]
    }) => {
      await mainAxios.post(
        `/chat/conversations/${conversationId}/messages/hide`,
        { messageIds },
      )
      return { conversationId, messageIds }
    },
    onSuccess: ({ conversationId, messageIds }) => {
      removeMessageFromCache(queryClient, conversationId, messageIds)
      queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
    },
  })
}

export const useDeleteMessageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageId,
    }: {
      conversationId: string
      messageId: string
    }) => {
      await mainAxios.delete(
        `/chat/conversations/${conversationId}/messages/${messageId}`,
      )
    },
    onSuccess: (_data, { conversationId, messageId }) => {
      removeMessageFromCache(queryClient, conversationId, messageId)
      queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
    },
  })
}

export const useEditMessageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageId,
      content,
    }: {
      conversationId: string
      messageId: string
      content: string
    }) => patchChatMessage(conversationId, messageId, { content }),
    onSuccess: message => {
      updateMessageInCache(queryClient, message)
      queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
    },
  })
}

export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateConversationDto) => {
      const { data } = await mainAxios.post<ChatConversation>(
        '/chat/conversations',
        body,
      )
      return normalizeConversation(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })
      queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
    },
  })
}

export const usePinConversationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      isPinned,
    }: {
      conversationId: string
      isPinned: boolean
    }) => {
      const { data } = await mainAxios.patch<ChatConversation>(
        `/chat/conversations/${conversationId}`,
        { isPinned },
      )
      return normalizeConversation(data)
    },
    onMutate: async ({ conversationId, isPinned }) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.conversationsRoot() })

      const previous = queryClient.getQueriesData<ChatConversation[]>(
        conversationsQueryFilter,
      )

      updateConversationsCache(queryClient, old => {
        if (!old) return old

        return sortConversationsByUnread(
          old.map(item =>
            item.id === conversationId ? { ...item, isPinned } : item,
          ),
        )
      })

      return { previous }
    },
    onError: (_error, _variables, context) => {
      context?.previous?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: conversation => {
      updateConversationsCache(queryClient, old => {
        if (!old) return [conversation]

        return sortConversationsByUnread(
          old.map(item =>
            item.id === conversation.id ? conversation : item,
          ),
        )
      })
    },
  })
}

export const useHideConversationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await mainAxios.delete(`/chat/conversations/${conversationId}`)
      return conversationId
    },
    onSuccess: conversationId => {
      updateConversationsCache(queryClient, old => {
        if (!old) return old

        return old.filter(item => item.id !== conversationId)
      })
      void queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() })
    },
  })
}

export const invalidateConversations = () =>
  queryClient.invalidateQueries({ queryKey: chatKeys.conversationsRoot() })

export const uploadConversationMedia = async (
  conversationId: string,
  file: File,
) => {
  const prepared = await prepareFileForUpload(file)
  const formData = new FormData()
  // Third arg sets Content-Disposition filename → multer `originalname`
  formData.append('file', prepared, file.name)
  formData.append('fileName', file.name)

  const { data } = await mainAxios.post<UploadMediaResponse>(
    '/media/upload',
    formData,
    {
      params: { conversationId },
    },
  )

  return {
    ...data,
    fileName: data.fileName?.trim() || file.name,
  }
}

export const uploadConversationMediaBatch = async (
  conversationId: string,
  files: File[],
): Promise<ChatMessageMedia[]> => {
  const uploads = await mapInBatches(
    files,
    file => uploadConversationMedia(conversationId, file),
    MEDIA_UPLOAD_CONCURRENCY,
  )

  return uploads.map(toChatMessageMedia)
}

export type CopyTaskMediaToConversationParams = {
  taskId: string
  conversationId: string
  kind?: 'main' | 'report'
  mediaIds?: string[]
}

/** Server-side S3 copy: tasks/{taskId}/… → chats/{conversationId}/… */
export const copyTaskMediaToConversation = async ({
  taskId,
  conversationId,
  kind = 'main',
  mediaIds,
}: CopyTaskMediaToConversationParams): Promise<ChatMessageMedia[]> => {
  const { data } = await mainAxios.post<UploadMediaResponse[]>(
    '/media/copy-to-conversation',
    {
      taskId,
      conversationId,
      kind,
      ...(mediaIds?.length ? { mediaIds } : {}),
    },
  )

  return data.map(toChatMessageMedia)
}

export const useSearchMessagesQuery = (
  conversationId: string | null,
  params: SearchMessagesParams,
) => {
  const trimmedQuery = params.q.trim()
  const page = params.page ?? 1
  const limit = params.limit ?? 20

  return useQuery({
    queryKey: chatKeys.searchMessages(
      conversationId ?? '',
      trimmedQuery,
      page,
      limit,
    ),
    queryFn: async () => {
      const { data } = await mainAxios.get<PaginatedResponse<ChatMessage>>(
        `/chat/conversations/${conversationId}/messages/search`,
        { params: { q: trimmedQuery, page, limit } },
      )

      return {
        ...data,
        items: data.items.map(normalizeMessage),
      }
    },
    enabled: Boolean(conversationId && trimmedQuery.length >= 2),
  })
}

export const useAttachmentsQuery = (
  conversationId: string | null,
  params?: AttachmentsParams,
) => {
  const page = params?.page ?? 1
  const limit = params?.limit ?? 20
  const type = params?.type

  return useQuery({
    queryKey: chatKeys.attachments(conversationId ?? '', {
      type,
      page,
      limit,
    }),
    queryFn: async () => {
      const { data } = await mainAxios.get<PaginatedResponse<ChatAttachment>>(
        `/chat/conversations/${conversationId}/attachments`,
        { params: { type, page, limit } },
      )

      return data
    },
    enabled: Boolean(conversationId),
  })
}
