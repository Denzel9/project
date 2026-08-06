import {
  isChatTaskTzMessage,
  parseChatTaskTzMessage,
  type ChatMessage,
} from '@/entities/chat'

export type ChatTaskTzItem = {
  message: ChatMessage
  taskId: string
  title: string
}

export const getChatTaskTzTitle = (content: string) => {
  const parsed = parseChatTaskTzMessage(content)

  if (!parsed) {
    return 'Техническое задание'
  }

  const titleMatch = parsed.content.match(/^#\s*ТЗ:\s*(.+)$/m)

  return titleMatch?.[1]?.trim() || 'Техническое задание'
}

export const extractChatTaskTzMessages = (
  messages: ChatMessage[],
): ChatTaskTzItem[] =>
  messages.flatMap(message => {
    if (!isChatTaskTzMessage(message.content)) {
      return []
    }

    const parsed = parseChatTaskTzMessage(message.content)

    if (!parsed) {
      return []
    }

    return [
      {
        message,
        taskId: parsed.taskId,
        title: getChatTaskTzTitle(message.content),
      },
    ]
  })
