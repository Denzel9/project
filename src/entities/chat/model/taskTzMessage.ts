export const CHAT_TASK_TZ_MARKER_REGEX = /^<!-- chat-task-tz:([\w-]+) -->\n?/

export const wrapChatTaskTzMessage = (taskId: string, markdown: string) =>
  `<!-- chat-task-tz:${taskId} -->\n${markdown}`

export const parseChatTaskTzMessage = (text: string) => {
  const match = text.trim().match(CHAT_TASK_TZ_MARKER_REGEX)

  if (!match) {
    return null
  }

  return {
    taskId: match[1],
    content: text.slice(match[0].length),
  }
}

export const isChatTaskTzMessage = (text: string) =>
  CHAT_TASK_TZ_MARKER_REGEX.test(text.trim())

export const getChatTaskTzPreview = (text: string) => {
  const parsed = parseChatTaskTzMessage(text)

  if (!parsed) {
    return null
  }

  const titleMatch = parsed.content.match(/^#\s*ТЗ:\s*(.+)$/m)

  return titleMatch?.[1]?.trim()
    ? `ТЗ: ${titleMatch[1].trim()}`
    : 'Техническое задание'
}
