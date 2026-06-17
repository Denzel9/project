import { useEffect, useState } from 'react'

import { useDeleteMediaMutation } from '@/entities/media'
import {
  mapTaskMediaToPhotos,
  useUploadTaskMediaMutation,
  type Task,
} from '@/entities/task'

import type { Photo } from '@/entities/photo'

const isLocalPreview = (photo: Photo) => photo.url.startsWith('blob:')

type UseTaskMediaSaveOptions = {
  task: Task | undefined
  canEditMedia: boolean
}

export const useTaskMediaSave = ({
  task,
  canEditMedia,
}: UseTaskMediaSaveOptions) => {
  const [files, setFiles] = useState<File[]>([])
  const [images, setImages] = useState<Photo[]>([])

  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useUploadTaskMediaMutation()
  const { mutateAsync: deleteMedia, isPending: isDeleting } =
    useDeleteMediaMutation()

  useEffect(() => {
    if (!task || files.length > 0) return

    setImages(mapTaskMediaToPhotos(task.media))
  }, [task, files.length])

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

    await uploadMedia({ taskId: task.id, files })
    setFiles([])
  }

  return {
    files,
    images,
    isPending: isUploading || isDeleting,
    setFiles,
    setImages,
    handleRemoveImage,
    handleSaveMedia,
  }
}
