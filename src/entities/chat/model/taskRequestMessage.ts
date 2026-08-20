export type ChatTaskRequestKind = 'annulment' | 'deadline'

export type ChatTaskRequestMessage = {
  kind: ChatTaskRequestKind
  taskId: string
  requestId: string | null
  taskTitle: string | null
  reason: string | null
  proposedDate: string | null
  content: string
}

const CHAT_TASK_ANNULMENT_MARKER_REGEX =
  /^<!-- chat-task-annulment:([\w-]+)(?::([\w-]+))? -->\n?/
const CHAT_TASK_DEADLINE_MARKER_REGEX =
  /^<!-- chat-task-deadline:([\w-]+)(?::([\w-]+))? -->\n?/

const parseMarkedRequest = (
  text: string,
  kind: ChatTaskRequestKind,
  regex: RegExp,
  headingPrefix: string,
): ChatTaskRequestMessage | null => {
  const trimmed = text.trim()
  const match = trimmed.match(regex)

  if (!match) {
    return null
  }

  const rest = trimmed.slice(match[0].length).trim()
  const titleMatch = rest.match(
    new RegExp(`^${headingPrefix} задачи «(.+?)»(?:\\n|$)`),
  )
  const reasonMatch = rest.match(/(?:^|\n)Причина:\s*(.+)$/)
  const dateMatch =
    kind === 'deadline' ? rest.match(/(?:^|\n)Новая дата:\s*(.+)/) : null

  return {
    kind,
    taskId: match[1],
    requestId: match[2] || null,
    taskTitle: titleMatch?.[1]?.trim() || null,
    reason: reasonMatch?.[1]?.trim() || null,
    proposedDate: dateMatch?.[1]?.trim() || null,
    content: rest,
  }
}

export const parseChatTaskAnnulmentMessage = (text: string) =>
  parseMarkedRequest(
    text,
    'annulment',
    CHAT_TASK_ANNULMENT_MARKER_REGEX,
    'Запрос на аннулирование',
  )

export const parseChatTaskDeadlineMessage = (text: string) =>
  parseMarkedRequest(
    text,
    'deadline',
    CHAT_TASK_DEADLINE_MARKER_REGEX,
    'Запрос на перенос дедлайна',
  )

export const parseChatTaskRequestMessage = (
  text: string,
): ChatTaskRequestMessage | null =>
  parseChatTaskAnnulmentMessage(text) ?? parseChatTaskDeadlineMessage(text)

export const isChatTaskRequestMessage = (text: string) =>
  Boolean(parseChatTaskRequestMessage(text))

export const getChatTaskRequestPreview = (text: string) => {
  const parsed = parseChatTaskRequestMessage(text)

  if (!parsed) {
    return null
  }

  return parsed.kind === 'annulment'
    ? 'Запрос на аннулирование'
    : 'Запрос на перенос дедлайна'
}
