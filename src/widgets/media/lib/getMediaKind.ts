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

export const getFileNameFromKey = (key: string) => key.split('/').pop() ?? 'Документ'
