import {
  type ChatConversation,
  type CreateConversationDto,
} from '@/entities/chat'
import chatSocket from '@/shared/api/socket'
import { getProfileShareUrl } from '@/shared/lib/share/shareTargets'

type SendProfileLinkToChatParams = {
  userId: string
  profileTitle?: string | null
  peerId: string
  conversations?: ChatConversation[]
  createConversation: (
    body: CreateConversationDto,
  ) => Promise<ChatConversation>
}

export const formatProfileLinkForChat = (
  userId: string,
  profileTitle?: string | null,
) => {
  const url = getProfileShareUrl(userId)
  const title = profileTitle?.trim()

  return title ? `${title}\n${url}` : url
}

export const sendProfileLinkToChat = async ({
  userId,
  profileTitle,
  peerId,
  conversations,
  createConversation,
}: SendProfileLinkToChatParams): Promise<boolean> => {
  const content = formatProfileLinkForChat(userId, profileTitle)

  const existing = conversations?.find(
    conversation => conversation.peer.id === peerId,
  )
  const conversation =
    existing ?? (await createConversation({ recipientId: peerId }))

  chatSocket.connect()
  chatSocket.joinConversation(conversation.id)
  chatSocket.sendMessage({
    conversationId: conversation.id,
    content,
  })

  return true
}
