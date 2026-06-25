import { useEffect, useState } from 'react'

import { useDeleteMediaMutation } from '@/entities/media'
import {
  mapTaskMediaToPhotos,
  useUploadTaskMediaMutation,
  type Task,
  type TaskMediaUploadKind,
} from '@/entities/task'

import type { Photo } from '@/entities/photo'

const isLocalPreview = (photo: Photo) => photo.url.startsWith('blob:')

type UseTaskMediaSaveOptions = {
  task: Task | undefined
  canEditMedia: boolean
  kind?: TaskMediaUploadKind
}

export const useTaskMediaSave = ({
  task,
  canEditMedia,
  kind = 'main',
}: UseTaskMediaSaveOptions) => {
  const [files, setFiles] = useState<File[]>([])
  const [images, setImages] = useState<Photo[]>([])

  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useUploadTaskMediaMutation()
  const { mutateAsync: deleteMedia, isPending: isDeleting } =
    useDeleteMediaMutation()

  useEffect(() => {
    if (!task || files.length > 0) return

    const media = kind === 'report' ? (task.reportMedia ?? []) : task.media
    const serverImages = mapTaskMediaToPhotos(media)

    setImages(prev => {
      if (prev.some(isLocalPreview)) return prev

      const serverKeys = serverImages.map(image => image.key).join('|')
      const prevServerKeys = prev
        .filter(image => !isLocalPreview(image))
        .map(image => image.key)
        .join('|')

      if (!serverImages.length && prevServerKeys) return prev
      if (serverKeys === prevServerKeys && prev.length === serverImages.length) {
        return prev
      }

      return serverImages
    })
  }, [task, files.length, kind])

  const handleRemoveImage = async (key: string) => {
    const photo = images.find(image => image.key === key)
    if (!photo) return

    if (isLocalPreview(photo)) {
      setImages(prev => prev.filter(image => image.key !== key))

      if (photo.filename) {
        setFiles(prev => prev.filter(file => file.name !== photo.filename))
      }

      return
    }

    if (!photo.id || !task || !canEditMedia) return

    try {
      await deleteMedia({ mediaId: photo.id, taskId: task.id })
      setImages(prev => prev.filter(image => image.key !== key))
    } catch {
      // keep image in list on error
    }
  }

  const handleSaveMedia = async () => {
    if (!task || !canEditMedia || files.length === 0) return

    const uploads = await uploadMedia({ taskId: task.id, files, kind })
    const uploadedPhotos: Photo[] = uploads.map(upload => ({
      id: upload.key,
      url: upload.url,
      key: upload.key,
      mimeType: upload.mimeType,
      size: String(upload.size),
    }))

    setFiles([])
    setImages(prev => {
      prev
        .filter(isLocalPreview)
        .forEach(photo => URL.revokeObjectURL(photo.url))

      return [
        ...prev.filter(photo => !isLocalPreview(photo)),
        ...uploadedPhotos,
      ]
    })
  }

  const handleCancel = () => {
    setFiles([])

    if (!task) {
      setImages([])
      return
    }

    const media = kind === 'report' ? (task.reportMedia ?? []) : task.media

    setImages(mapTaskMediaToPhotos(media))
  }

  return {
    files,
    images,
    isPending: isUploading || isDeleting,
    setFiles,
    setImages,
    handleRemoveImage,
    handleSaveMedia,
    handleCancel,
  }
}
