export const CHAT_APPLICATION_MARKER_REGEX =
  /^<!-- chat-application:([\w-]+) -->\n?/

export const wrapChatApplicationMessage = (
  postId: string,
  postTitle: string,
  letter: string,
) => {
  const title = postTitle.trim() || 'объявление'
  const header = `Новый отклик на объявление «${title}»`
  const body = letter.trim()
  const content = body ? `${header}\n\n${body}` : header

  return `<!-- chat-application:${postId} -->\n${content}`
}

export const parseChatApplicationMessage = (text: string) => {
  const trimmed = text.trim()
  const marker = trimmed.match(CHAT_APPLICATION_MARKER_REGEX)
  const rest = marker ? trimmed.slice(marker[0].length).trim() : trimmed
  const postId = marker?.[1] ?? null

  if (rest === 'Новый отклик') {
    return { postId, postTitle: null, letter: '' }
  }

  const headerMatch = rest.match(
    /^Новый отклик на объявление «(.+?)»(?:\n+([\s\S]*))?$/,
  )

  if (headerMatch) {
    return {
      postId,
      postTitle: headerMatch[1]?.trim() || null,
      letter: headerMatch[2]?.trim() ?? '',
    }
  }

  if (marker) {
    return { postId, postTitle: null, letter: rest }
  }

  return null
}

export const isChatApplicationMessage = (text: string) =>
  Boolean(parseChatApplicationMessage(text))

export const getChatApplicationPreview = (text: string) => {
  const parsed = parseChatApplicationMessage(text)

  if (!parsed) {
    return null
  }

  if (parsed.postTitle) {
    return `Новый отклик на объявление «${parsed.postTitle}»`
  }

  return 'Новый отклик'
}
