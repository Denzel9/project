import {
  MEDIA_DOCUMENT_MAX_BYTES,
  MEDIA_IMAGE_MAX_BYTES,
  MEDIA_VIDEO_MAX_BYTES,
} from './constants'

export type MediaFileKind = 'image' | 'video' | 'document' | 'unknown'

export const getMediaFileKind = (file: File): MediaFileKind => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'

  if (
    file.type === 'application/pdf' ||
    file.type.startsWith('application/vnd.')
  ) {
    return 'document'
  }

  return 'unknown'
}

export const validateMediaFile = (file: File): string | null => {
  const kind = getMediaFileKind(file)

  if (kind === 'unknown') {
    return 'Неподдерживаемый тип файла'
  }

  if (kind === 'image') {
    return file.size > MEDIA_IMAGE_MAX_BYTES
      ? 'Размер фото не должен превышать 10 МБ'
      : null
  }

  if (kind === 'video') {
    return file.size > MEDIA_VIDEO_MAX_BYTES
      ? 'Размер видео не должен превышать 100 МБ'
      : null
  }

  return file.size > MEDIA_DOCUMENT_MAX_BYTES
    ? 'Размер документа не должен превышать 25 МБ'
    : null
}

export const filterValidMediaFiles = (
  files: File[],
): { valid: File[]; errors: string[] } => {
  const valid: File[] = []
  const errors: string[] = []

  files.forEach(file => {
    const error = validateMediaFile(file)

    if (error) {
      if (!errors.includes(error)) {
        errors.push(error)
      }

      return
    }

    valid.push(file)
  })

  return { valid, errors }
}
