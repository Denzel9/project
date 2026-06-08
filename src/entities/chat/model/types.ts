export type ChatPeerRole = 'CREATOR' | 'COMPANY'

export type ChatPeer = {
  id: string
  role: ChatPeerRole
  avatar: string | null
  displayName: string
}

export type ChatMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
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
