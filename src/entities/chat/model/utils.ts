import { format, isSameDay, isToday, isYesterday, startOfDay } from 'date-fns'
import { ru } from 'date-fns/locale'

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
    if (a.isNotes !== b.isNotes) {
      return a.isNotes ? -1 : 1
    }

    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1
    }

    const aHasUnread = a.unreadCount > 0 || Boolean(a.isMarkedUnread)
    const bHasUnread = b.unreadCount > 0 || Boolean(b.isMarkedUnread)

    if (aHasUnread !== bHasUnread) {
      return aHasUnread ? -1 : 1
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })

const capitalizeRu = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value

/** Чип в ленте чата: «Пятница, 26 июня» */
export const formatChatDaySeparatorLabel = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)

  if (isToday(date)) return 'Сегодня'
  if (isYesterday(date)) return 'Вчера'

  return capitalizeRu(format(date, 'EEEE, d MMMM', { locale: ru }))
}

export const getChatDayKey = (dateInput: string | Date) =>
  format(
    startOfDay(dateInput instanceof Date ? dateInput : new Date(dateInput)),
    'yyyy-MM-dd',
  )

export const isSameChatDay = (
  left: string | Date,
  right: string | Date,
) =>
  isSameDay(
    left instanceof Date ? left : new Date(left),
    right instanceof Date ? right : new Date(right),
  )

/**
 * Сокращённый день последнего сообщения в списке диалогов:
 * сегодня / вчера / пт / 26.06
 */
export const formatConversationListDayLabel = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)

  if (isToday(date)) return 'сегодня'
  if (isYesterday(date)) return 'вчера'

  const now = new Date()
  const diffMs = startOfDay(now).getTime() - startOfDay(date).getTime()
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000))

  if (diffDays > 0 && diffDays < 7) {
    return format(date, 'EEE', { locale: ru })
  }

  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'd MMM', { locale: ru })
  }

  return format(date, 'dd.MM.yy')
}
