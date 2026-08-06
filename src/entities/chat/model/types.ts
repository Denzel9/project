export type ChatPeerRole = 'CREATOR' | 'COMPANY'

export type ChatPeer = {
  id: string
  role: ChatPeerRole
  avatar: string | null
  displayName: string
}

export type ChatMessageMedia = {
  url: string
  key: string
  size: string
  mimeType: string
}

export type ChatMessageActorKind = 'OWNER' | 'MANAGER'

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  actorAccountId?: string | null
  actorDisplayName?: string | null
  actorKind?: ChatMessageActorKind | null
  content: string
  media: ChatMessageMedia[]
  createdAt: string
  editedAt: string | null
  isRedirected: boolean
  isRead: boolean
}

export type ChatMessagePin = {
  messageId: string
  content: string
  mediaCount: number
  pinnedAt: string
  pinnedById?: string
  createdAt: string
}

export type ChatConversation = {
  id: string
  peer: ChatPeer
  lastMessage: ChatMessage | null
  unreadCount: number
  isPinned: boolean
  updatedAt: string
}

export type ChatUnreadCount = {
  count: number
}

export type ChatMessagesReadEvent = {
  conversationId: string
  userId: string
  readAt: string
}

export type ChatMessageDeletedEvent = {
  conversationId: string
  messageId: string
}

export type ChatMessageEditedEvent = ChatMessage

export type PatchChatMessageDto = {
  content: string
}

export type CreateConversationDto = {
  recipientId: string
}

export type ChatAttachment = {
  id: string
  messageId: string
  senderId: string
  url: string
  key: string
  size: string
  mimeType: string
  createdAt: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

export type SearchMessagesParams = {
  q: string
  page?: number
  limit?: number
}

export type ConversationsParams = {
  q?: string
  peerId?: string
}

export type AttachmentsParams = {
  type?: 'image' | 'video' | 'document'
  page?: number
  limit?: number
}
