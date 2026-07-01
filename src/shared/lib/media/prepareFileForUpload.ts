import imageCompression from 'browser-image-compression'

import { MEDIA_PREPARE_CONCURRENCY } from './constants'
import { mapInBatches } from './mapInBatches'
import { validateMediaFile } from './validateMediaFile'

export const isImageForCompression = (file: File) =>
  file.type.startsWith('image/') && file.type !== 'image/gif'

const getCompressedFileType = (file: File) => {
  if (file.type === 'image/png') return 'image/png'
  if (file.type === 'image/gif') return 'image/gif'

  return 'image/webp'
}

export const prepareFileForUpload = async (file: File): Promise<File> => {
  if (!isImageForCompression(file)) {
    const validationError = validateMediaFile(file)

    if (validationError) {
      throw new Error(validationError)
    }

    return file
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 9,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.82,
    fileType: getCompressedFileType(file),
  })

  const prepared = compressed.size <= file.size ? compressed : file
  const validationError = validateMediaFile(prepared)

  if (validationError) {
    throw new Error(validationError)
  }

  return prepared
}

export const prepareFilesForUpload = (files: File[]) =>
  mapInBatches(files, file => prepareFileForUpload(file), MEDIA_PREPARE_CONCURRENCY)
