export type MediaKind = 'image' | 'video' | 'document'

const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogg|avi)(\?|$)/i
const DOCUMENT_EXT = /\.(pdf|docx?|xlsx?|csv|zip)(\?|$)/i
const UUID_FILE_NAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'application/pdf': 'pdf',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
  'application/x-zip': 'zip',
  'text/csv': 'csv',
  'application/csv': 'csv',
  'text/comma-separated-values': 'csv',
}

export const isDocumentMimeType = (mimeType?: string) =>
  Boolean(
    mimeType &&
      (mimeType === 'application/pdf' ||
        mimeType === 'application/msword' ||
        mimeType === 'application/zip' ||
        mimeType === 'application/x-zip-compressed' ||
        mimeType === 'application/x-zip' ||
        mimeType === 'text/csv' ||
        mimeType === 'application/csv' ||
        mimeType === 'text/comma-separated-values' ||
        mimeType.startsWith('application/vnd.')),
  )

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

const getExtension = (fileName?: string, mimeType?: string) => {
  const fromName = fileName?.split('.').pop()?.toLowerCase()
  if (fromName && /^[a-z0-9]+$/.test(fromName) && fromName !== fileName) {
    return fromName
  }

  return mimeType ? MIME_TO_EXTENSION[mimeType] : undefined
}

const fallbackDocumentName = (extension?: string) =>
  extension ? `Документ.${extension}` : 'Документ'

export const getFileNameFromKey = (key: string, mimeType?: string) => {
  const base = key.split('/').pop()?.split('?')[0] ?? ''
  if (!base) return fallbackDocumentName(getExtension(undefined, mimeType))

  const nameWithoutExt = base.replace(/\.[^.]+$/, '')
  const isUuid = UUID_FILE_NAME.test(nameWithoutExt)

  if (isUuid) {
    return fallbackDocumentName(getExtension(base, mimeType))
  }

  return base
}

export const getMediaDisplayName = (
  fileName?: string | null,
  keyOrUrl?: string,
  mimeType?: string,
) => {
  const trimmed = fileName?.trim()
  if (trimmed) {
    if (trimmed.includes('.')) return trimmed

    const extension = getExtension(undefined, mimeType)
    return extension ? `${trimmed}.${extension}` : trimmed
  }

  if (keyOrUrl) return getFileNameFromKey(keyOrUrl, mimeType)

  return fallbackDocumentName(getExtension(undefined, mimeType))
}
