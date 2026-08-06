import { validateMediaFile } from '@/shared/lib/media'

import { getChatTaskTzPreview } from './taskTzMessage'

import type { ChatConversation, ChatMessage, ChatMessageMedia } from './types'
import type { UploadMediaResponse } from '@/entities/post'

export const CHAT_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation'

export const toChatMessageMedia = (
  upload: UploadMediaResponse,
): ChatMessageMedia => ({
  url: upload.url,
  key: upload.key,
  mimeType: upload.mimeType,
  size: String(upload.size),
})

export const validateChatMediaFile = (file: File): string | null =>
  validateMediaFile(file)

export const getMessagePreview = (
  content: string,
  media: ChatMessageMedia[],
  isRedirected = false,
) => {
  const prefix = isRedirected ? 'Переслано: ' : ''
  const trimmed = content.trim()

  if (trimmed) {
    const tzPreview = getChatTaskTzPreview(trimmed)

    if (tzPreview) {
      return `${prefix}${tzPreview}`
    }

    return `${prefix}${trimmed}`
  }

  if (!media.length) return isRedirected ? 'Переслано' : 'Нет сообщений'

  const hasVideo = media.some(item => item.mimeType.startsWith('video/'))
  const hasImage = media.some(item => item.mimeType.startsWith('image/'))
  const hasPdf = media.some(item => item.mimeType.startsWith('application/pdf'))
  const hasSpreadsheet = media.some(item =>
    item.mimeType.startsWith(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ),
  )
  const hasWord = media.some(item =>
    item.mimeType.startsWith(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ),
  )
  const hasPresentation = media.some(item =>
    item.mimeType.startsWith(
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ),
  )

  if (
    hasVideo &&
    hasImage &&
    hasPdf &&
    hasSpreadsheet &&
    hasWord &&
    hasPresentation
  ) {
    return `${prefix}Медиа`
  }
  if (hasVideo) return `${prefix}Видео`
  if (hasImage) return `${prefix}Фото`
  if (hasPdf) return `${prefix}PDF`
  if (hasSpreadsheet) return `${prefix}Spreadsheet`
  if (hasWord) return `${prefix}Word`
  if (hasPresentation) return `${prefix}Presentation`

  return `${prefix}Медиа`
}

export const MESSAGE_DELETE_WINDOW_MS = 60_000

export const isMessageDeletable = (
  createdAt: string,
  senderId: string,
  currentUserId: string | null | undefined,
  now = Date.now(),
) => {
  if (!currentUserId || senderId !== currentUserId) {
    return false
  }

  return now - new Date(createdAt).getTime() < MESSAGE_DELETE_WINDOW_MS
}

export const isMessageEditable = (
  createdAt: string,
  senderId: string,
  currentUserId: string | null | undefined,
  now = Date.now(),
) => isMessageDeletable(createdAt, senderId, currentUserId, now)

export const getUnreadDividerMessageId = (
  messages: ChatMessage[],
  currentUserId: string,
  unreadCount: number,
): string | null => {
  if (unreadCount <= 0) return null

  const incoming = messages.filter(message => message.senderId !== currentUserId)

  if (!incoming.length) return null

  const firstExplicitUnread = incoming.find(message => !message.isRead)

  if (firstExplicitUnread) {
    return firstExplicitUnread.id
  }

  const startIndex = Math.max(0, incoming.length - unreadCount)

  return incoming[startIndex]?.id ?? null
}

export const sortConversationsByUnread = (
  conversations: ChatConversation[],
): ChatConversation[] =>
  [...conversations].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1
    }

    const aHasUnread = a.unreadCount > 0
    const bHasUnread = b.unreadCount > 0

    if (aHasUnread !== bHasUnread) {
      return aHasUnread ? -1 : 1
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
