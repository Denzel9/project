export const CHAT_TASK_INVITE_MARKER_REGEX =
  /^<!-- chat-task-invite:([\w-]+) -->\n?/

export const wrapChatTaskInviteMessage = (taskId: string, taskTitle: string) => {
  const title = taskTitle.trim()
  const body = title
    ? `Вас назначили исполнителем задачи «${title}»`
    : 'Вас назначили исполнителем задачи'

  return `<!-- chat-task-invite:${taskId} -->\n${body}`
}

export const parseChatTaskInviteMessage = (text: string) => {
  const trimmed = text.trim()
  const match = trimmed.match(CHAT_TASK_INVITE_MARKER_REGEX)

  if (!match) {
    return null
  }

  const rest = trimmed.slice(match[0].length).trim()
  const titleMatch = rest.match(/^Вас назначили исполнителем задачи «(.+?)»$/)

  return {
    taskId: match[1],
    taskTitle: titleMatch?.[1]?.trim() || null,
    content: rest,
  }
}

export const isChatTaskInviteMessage = (text: string) =>
  Boolean(parseChatTaskInviteMessage(text))

export const getChatTaskInvitePreview = (text: string) => {
  const parsed = parseChatTaskInviteMessage(text)

  if (!parsed) {
    return null
  }

  return 'Приглашение на задачу'
}
