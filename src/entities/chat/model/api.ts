import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'

import { mainAxios, queryClient } from '@/shared/api'

import { toChatMessageMedia } from './utils'

import type {
  AttachmentsParams,
  ChatAttachment,
  ChatConversation,
  ChatMessage,
  ChatMessageMedia,
  CreateConversationDto,
  PaginatedResponse,
  SearchMessagesParams,
} from './types'
import type { UploadMediaResponse } from '@/entities/post'

export { toChatMessageMedia, validateChatMediaFile, CHAT_MEDIA_ACCEPT, getMessagePreview } from './utils'

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string, cursor?: string) =>
    [...chatKeys.all, 'messages', conversationId, cursor ?? ''] as const,
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

const sortMessages = (messages: ChatMessage[]) =>
  [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

const normalizeMessage = (message: ChatMessage): ChatMessage => ({
  ...message,
  media: message.media ?? [],
})

export const appendMessageToCache = (
  client: QueryClient,
  conversationId: string,
  message: ChatMessage,
) => {
  client.setQueryData<ChatMessage[]>(
    chatKeys.messages(conversationId),
    old => {
      if (!old?.length) return [message]

      if (old.some(item => item.id === message.id)) {
        return old
      }

      return sortMessages([...old, normalizeMessage(message)])
    },
  )
}

export const useConversationsQuery = () =>
  useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async () => {
      const { data } = await mainAxios.get<ChatConversation[]>(
        '/chat/conversations',
      )
      return data
    },
  })

export const useMessagesQuery = (
  conversationId: string | null,
  options?: { cursor?: string; limit?: number },
) =>
  useQuery({
    queryKey: chatKeys.messages(conversationId ?? '', options?.cursor),
    queryFn: async () => {
      const { data } = await mainAxios.get<ChatMessage[]>(
        `/chat/conversations/${conversationId}/messages`,
        { params: { cursor: options?.cursor, limit: options?.limit ?? 50 } },
      )
      return sortMessages(data.map(normalizeMessage))
    },
    enabled: Boolean(conversationId),
  })

export const useCreateConversationMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: CreateConversationDto) => {
      const { data } = await mainAxios.post<ChatConversation>(
        '/chat/conversations',
        body,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })
    },
  })
}

export const invalidateConversations = () =>
  queryClient.invalidateQueries({ queryKey: chatKeys.conversations() })

export const uploadConversationMedia = async (
  conversationId: string,
  file: File,
) => {
  const formData = new FormData()
  formData.append('file', file)

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
  const uploads = await Promise.all(
    files.map(file => uploadConversationMedia(conversationId, file)),
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
