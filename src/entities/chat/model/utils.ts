import type { ChatMessageMedia } from './types'
import type { UploadMediaResponse } from '@/entities/post'
import { validateMediaFile } from '@/shared/lib/media'

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

export const getMessagePreview = (content: string, media: ChatMessageMedia[]) => {
  const trimmed = content.trim()

  if (trimmed) return trimmed

  if (!media.length) return 'Нет сообщений'

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
    return 'Медиа'
  }
  if (hasVideo) return 'Видео'
  if (hasImage) return 'Фото'
  if (hasPdf) return 'PDF'
  if (hasSpreadsheet) return 'Spreadsheet'
  if (hasWord) return 'Word'
  if (hasPresentation) return 'Presentation'

  return 'Медиа'
}
