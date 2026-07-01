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

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  media: ChatMessageMedia[]
  createdAt: string
}

export type ChatConversation = {
  id: string
  peer: ChatPeer
  lastMessage: ChatMessage | null
  updatedAt: string
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

export type AttachmentsParams = {
  type?: 'image' | 'video' | 'document'
  page?: number
  limit?: number
}
