import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { mainAxios, queryClient } from '@/shared/api'

import type {
  ChatConversation,
  ChatMessage,
  CreateConversationDto,
} from './types'

export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  messages: (conversationId: string, cursor?: string) =>
    [...chatKeys.all, 'messages', conversationId, cursor ?? ''] as const,
}

export const useConversationsQuery = () =>
  useQuery({
    queryKey: chatKeys.conversations(),
    queryFn: async () => {
      const { data } = await mainAxios.get<ChatConversation[]>('/chat/conversations')
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
      return data
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
