import { prepareFileForUpload } from './prepareFileForUpload'
import { filterValidMediaFiles, getMediaFileKind } from './validateMediaFile'

import type { MediaUploadStatus, Photo } from '@/entities/photo'

export type LocalMediaFile = {
  localId: string
  file: File
  prepared: boolean
}

export type { MediaUploadStatus }

export type MediaUploadProgressEvent = {
  localId: string
  progress: number
}

export type MediaUploadCallbacks = {
  onFileStart?: (localId: string) => void
  onFileProgress?: (localId: string, progress: number) => void
  onFileSuccess?: (localId: string) => void
  onFileError?: (localId: string, error: Error) => void
}

const createLocalId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`

export const getFileIdentity = (file: File) =>
  `${file.name}:${file.size}:${file.lastModified}`

export const isDuplicateMediaFile = (
  file: File,
  existingFiles: Array<File | LocalMediaFile>,
) => {
  const identity = getFileIdentity(file)

  return existingFiles.some(item => {
    const candidate = item instanceof File ? item : item.file

    return getFileIdentity(candidate) === identity
  })
}

export const createLocalPhoto = (
  file: File,
  localId: string,
  previewUrl: string,
  status: MediaUploadStatus = 'preparing',
): Photo => ({
  localId,
  key: localId,
  url: previewUrl,
  filename: file.name,
  mimeType: file.type,
  size: String(file.size),
  lastModified: String(file.lastModified),
  uploadStatus: status,
  uploadProgress: 0,
})

export const revokeLocalPhotoUrl = (photo: Photo) => {
  if (photo.url.startsWith('blob:')) {
    URL.revokeObjectURL(photo.url)
  }
}

export const createLocalMediaPlaceholders = (
  selectedFiles: File[],
  existingFiles: LocalMediaFile[],
  options?: {
    maxCount?: number
    currentCount?: number
    onValidationError?: (message: string) => void
  },
): { placeholders: Photo[]; localFiles: LocalMediaFile[]; errors: string[] } => {
  const withoutDuplicates = selectedFiles.filter(
    file => !isDuplicateMediaFile(file, existingFiles),
  )

  if (
    withoutDuplicates.length < selectedFiles.length &&
    selectedFiles.length > 0
  ) {
    options?.onValidationError?.('Некоторые файлы уже были добавлены')
  }

  const { valid, errors } = filterValidMediaFiles(withoutDuplicates)

  if (errors.length) {
    options?.onValidationError?.(errors[0])
  }

  const availableSlots =
    options?.maxCount != null && options.currentCount != null
      ? Math.max(0, options.maxCount - options.currentCount)
      : valid.length

  const accepted = valid.slice(0, availableSlots)

  if (valid.length > accepted.length) {
    options?.onValidationError?.(
      `Можно добавить ещё ${availableSlots} файл(ов)`,
    )
  }

  const localFiles: LocalMediaFile[] = []
  const placeholders: Photo[] = []

  accepted.forEach(file => {
    const localId = createLocalId()
    const previewUrl = URL.createObjectURL(file)

    localFiles.push({ localId, file, prepared: false })
    placeholders.push(createLocalPhoto(file, localId, previewUrl, 'preparing'))
  })

  return { placeholders, localFiles, errors }
}

export const prepareLocalMediaFile = async (
  item: LocalMediaFile,
): Promise<LocalMediaFile> => {
  if (item.prepared) return item

  const prepared = await prepareFileForUpload(item.file)

  return {
    localId: item.localId,
    file: prepared,
    prepared: true,
  }
}

export const prepareLocalMediaFiles = async (
  items: LocalMediaFile[],
  onItemReady: (item: LocalMediaFile, previewUrl: string) => void,
  onItemError: (localId: string, error: Error) => void,
) => {
  await Promise.all(
    items.map(async item => {
      try {
        const prepared = await prepareLocalMediaFile(item)
        const previewUrl = URL.createObjectURL(prepared.file)
        onItemReady(prepared, previewUrl)
      } catch (error) {
        onItemError(
          item.localId,
          error instanceof Error ? error : new Error('Не удалось подготовить файл'),
        )
      }
    }),
  )
}

export const hasPreparingMedia = (images: Photo[]) =>
  images.some(image => image.uploadStatus === 'preparing')

export const hasFailedMedia = (images: Photo[]) =>
  images.some(image => image.uploadStatus === 'error')

export const hasVideoMedia = (files: LocalMediaFile[]) =>
  files.some(item => getMediaFileKind(item.file) === 'video')

export const toUploadFiles = (files: LocalMediaFile[]) =>
  files.map(item => item.file)

export const patchPhotoByLocalId = (
  images: Photo[],
  localId: string,
  patch: Partial<Photo>,
): Photo[] =>
  images.map(image =>
    image.localId === localId || image.key === localId
      ? { ...image, ...patch }
      : image,
  )
