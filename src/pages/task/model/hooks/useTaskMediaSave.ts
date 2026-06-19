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

    setImages(mapTaskMediaToPhotos(media))
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

    await uploadMedia({ taskId: task.id, files, kind })
    setFiles([])
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
