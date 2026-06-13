import type { UploadMediaResponse } from '@/entities/post'

import type { ChatMessageMedia } from './types'

const IMAGE_MAX_BYTES = 10 * 1024 * 1024
const VIDEO_MAX_BYTES = 100 * 1024 * 1024

export const CHAT_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime'

export const toChatMessageMedia = (
  upload: UploadMediaResponse,
): ChatMessageMedia => ({
  url: upload.url,
  key: upload.key,
  mimeType: upload.mimeType,
  size: String(upload.size),
})

export const validateChatMediaFile = (file: File): string | null => {
  const isVideo = file.type.startsWith('video/')
  const isImage = file.type.startsWith('image/')

  if (!isVideo && !isImage) {
    return 'Поддерживаются только фото (JPEG, PNG, WebP, GIF) и видео (MP4, WebM, MOV)'
  }

  if (isImage && file.size > IMAGE_MAX_BYTES) {
    return 'Размер фото не должен превышать 10 МБ'
  }

  if (isVideo && file.size > VIDEO_MAX_BYTES) {
    return 'Размер видео не должен превышать 100 МБ'
  }

  return null
}

export const getMessagePreview = (content: string, media: ChatMessageMedia[]) => {
  const trimmed = content.trim()

  if (trimmed) return trimmed

  if (!media.length) return 'Нет сообщений'

  const hasVideo = media.some(item => item.mimeType.startsWith('video/'))
  const hasImage = media.some(item => item.mimeType.startsWith('image/'))

  if (hasVideo && hasImage) return 'Медиа'
  if (hasVideo) return 'Видео'
  if (hasImage) return 'Фото'

  return 'Медиа'
}
