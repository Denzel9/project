let activeConversationId: string | null = null
let unreadHoldConversationId: string | null = null

export const setActiveChatConversationId = (id: string | null) => {
  activeConversationId = id
}

export const setUnreadHoldConversationId = (id: string | null) => {
  unreadHoldConversationId = id
}

/** False when the user already has this thread open (and is not in unread-hold). */
export const shouldCountIncomingChatUnread = (
  conversationId: string,
): boolean => {
  if (activeConversationId !== conversationId) {
    return true
  }

  return unreadHoldConversationId === conversationId
}
