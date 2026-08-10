export type MediaKind = 'image' | 'video' | 'document'

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg|avi)(\?|$)/i
const DOCUMENT_EXT = /\.(pdf|docx?|xlsx?|pptx?)(\?|$)/i

export const isDocumentMimeType = (mimeType?: string) =>
  mimeType === 'application/pdf' || Boolean(mimeType?.startsWith('application/vnd.'))

export const getMediaKind = (src: string, mimeType?: string): MediaKind => {
  if (mimeType?.startsWith('video/')) return 'video'
  if (mimeType?.startsWith('image/')) return 'image'
  if (isDocumentMimeType(mimeType)) return 'document'

  if (DOCUMENT_EXT.test(src)) return 'document'

  return VIDEO_EXT.test(src) ? 'video' : 'image'
}

export const isGalleryMedia = (mimeType?: string, src = '') => {
  const kind = getMediaKind(src, mimeType)

  return kind === 'image' || kind === 'video'
}

export const getFileNameFromKey = (key: string) => {
  const base = key.split('/').pop()?.split('?')[0] ?? ''
  if (!base) return 'Документ'

  // Storage keys are `uuid.ext` — don't show UUID as a human filename
  const nameWithoutExt = base.replace(/\.[^.]+$/, '')
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      nameWithoutExt,
    )

  return isUuid ? 'Документ' : base
}

export const getMediaDisplayName = (
  fileName?: string | null,
  keyOrUrl?: string,
) => {
  const trimmed = fileName?.trim()
  if (trimmed) return trimmed
  if (keyOrUrl) return getFileNameFromKey(keyOrUrl)
  return 'Документ'
}
