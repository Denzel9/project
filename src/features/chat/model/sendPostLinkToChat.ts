import {
  type ChatConversation,
  type CreateConversationDto,
} from '@/entities/chat'
import chatSocket from '@/shared/api/socket'
import { getPostShareUrl } from '@/shared/lib/share/shareTargets'

type SendPostLinkToChatParams = {
  postId: string
  postTitle?: string | null
  peerId: string
  conversations?: ChatConversation[]
  createConversation: (
    body: CreateConversationDto,
  ) => Promise<ChatConversation>
}

export const formatPostLinkForChat = (
  postId: string,
  postTitle?: string | null,
) => {
  const url = getPostShareUrl(postId)
  const title = postTitle?.trim()

  return title ? `${title}\n${url}` : url
}

export const sendPostLinkToChat = async ({
  postId,
  postTitle,
  peerId,
  conversations,
  createConversation,
}: SendPostLinkToChatParams): Promise<boolean> => {
  const content = formatPostLinkForChat(postId, postTitle)

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
