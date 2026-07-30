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

import { toChatMessageMedia } from './utils'

import type {
  AttachmentsParams,
  ChatAttachment,
  ChatConversation,
  ChatMessage,
  ChatMessageMedia,
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
} from './utils'

export const chatKeys = {
  all: ['chat'] as const,
  conversationsRoot: () => [...chatKeys.all, 'conversations'] as const,
  conversations: (params?: ConversationsParams) =>
    [...chatKeys.conversationsRoot(), params ?? {}] as const,
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

const sortMessages = (messages: ChatMessage[]) =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

const normalizeMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  media: message.media ?? [],
  isRead: message.isRead ?? false,
  editedAt: message.editedAt ?? null,
  isRedirected: message.isRedirected ?? false,
})

const normalizeConversation = (conversation: ChatConversation): ChatConversation => ({
  ...conversation,
  unreadCount: conversation.unreadCount ?? 0,
  lastMessage: conversation.lastMessage
    ? normalizeMessage(conversation.lastMessage)
    : null,
})

export const appendMessageToCache = (
  client: QueryClient,
  conversationId: string,
  message: ChatMessage,
) => {
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
) => {
  updateConversationsCache(client, old =>
    old?.map(conversation =>
      conversation.id === conversationId
        ? { ...conversation, unreadCount }
        : conversation,
    ),
  )
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
}

export const updateConversationLastMessage = (
  client: QueryClient,
  conversationId: string,
  message: ChatMessage,
) => {
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
        lastMessage:
          lastMessage && lastMessage.senderId !== currentUserId
            ? { ...lastMessage, isRead: true }
            : lastMessage,
      }
    }),
  )
}

export const removeMessageFromCache = (
  client: QueryClient,
  conversationId: string,
  messageId: string,
) => {
  client.setQueriesData<ChatMessage[]>(
    messagesQueryFilter(conversationId),
    old => old?.filter(message => message.id !== messageId),
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

      if (conversation.lastMessage?.id !== messageId) {
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
      return data.map(normalizeConversation)
    },
    enabled: options?.enabled ?? true,
  })
}

export const useMessagesQuery = (
  conversationId: string | null,
  options?: { cursor?: string; limit?: number; markRead?: boolean },
) => {
  const markRead = options?.markRead ?? !options?.cursor

  return useQuery({
    queryKey: chatKeys.messages(
      conversationId ?? '',
      options?.cursor,
      markRead,
    ),
    queryFn: async () => {
      const { data } = await mainAxios.get<ChatMessage[]>(
        `/chat/conversations/${conversationId}/messages`,
        {
          params: {
            cursor: options?.cursor,
            limit: options?.limit ?? 50,
            markRead,
          },
        },
      )

      return sortMessages(data.map(normalizeMessage))
    },
    enabled: Boolean(conversationId),
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
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      })
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
  formData.append('file', prepared)

  const { data } = await mainAxios.post<UploadMediaResponse>(
    '/media/upload',
    formData,
    {
      params: { conversationId },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  )

  return data
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
