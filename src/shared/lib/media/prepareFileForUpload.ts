import imageCompression from 'browser-image-compression'

export const isImageForCompression = (file: File) =>
  file.type.startsWith('image/') && file.type !== 'image/gif'

export const prepareFileForUpload = async (file: File): Promise<File> => {
  if (!isImageForCompression(file)) {
    return file
  }

  const compressed = await imageCompression(file, {
    maxSizeMB: 9,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.85,
    fileType: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
  })

  return compressed.size <= file.size ? compressed : file
}
