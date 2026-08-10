const seenIncomingMessageIds = new Set<string>()
const MAX_SEEN = 400

/** Dedupes unread increments when the same message is delivered twice (conversation + user room). */
export const claimIncomingChatMessage = (messageId: string): boolean => {
  if (seenIncomingMessageIds.has(messageId)) {
    return false
  }

  seenIncomingMessageIds.add(messageId)

  if (seenIncomingMessageIds.size > MAX_SEEN) {
    const oldest = seenIncomingMessageIds.values().next().value

    if (oldest) {
      seenIncomingMessageIds.delete(oldest)
    }
  }

  return true
}

export const resetIncomingChatMessageClaims = () => {
  seenIncomingMessageIds.clear()
}
