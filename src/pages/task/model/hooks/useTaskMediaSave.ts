import { useEffect, useRef, useState } from 'react'

import { useDeleteMediaMutation } from '@/entities/media'
import {
  mapTaskMediaToPhotos,
  useUploadTaskMediaMutation,
  type Task,
  type TaskMediaUploadKind,
} from '@/entities/task'

import type { Photo } from '@/entities/photo'
import {
  hasPreparingMedia,
  patchPhotoByLocalId,
  prepareLocalMediaFile,
  revokeLocalPhotoUrl,
  type LocalMediaFile,
} from '@/shared/lib/media'

const isLocalPreview = (photo: Photo) =>
  Boolean(photo.localId) || photo.url.startsWith('blob:')

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
  const [files, setFiles] = useState<LocalMediaFile[]>([])
  const [images, setImages] = useState<Photo[]>([])
  const prevTaskIdRef = useRef<string | undefined>(undefined)

  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useUploadTaskMediaMutation()
  const { mutateAsync: deleteMedia, isPending: isDeleting } =
    useDeleteMediaMutation()

  useEffect(() => {
    if (!task) {
      prevTaskIdRef.current = undefined
      setFiles([])
      setImages([])
      return
    }

    const media = kind === 'report' ? (task.reportMedia ?? []) : task.media
    const serverImages = mapTaskMediaToPhotos(media)
    const taskChanged = prevTaskIdRef.current !== task.id
    prevTaskIdRef.current = task.id

    if (taskChanged) {
      setFiles([])
      setImages(serverImages)
      return
    }

    if (files.length > 0) return

    setImages(prev => {
      const localPreviews = prev.filter(
        image => Boolean(image.localId) || image.url.startsWith('blob:'),
      )

      if (localPreviews.length > 0) return prev

      const serverKeySet = new Set(serverImages.map(image => image.key))
      const optimisticUploads = prev.filter(
        image =>
          !image.localId &&
          !image.url.startsWith('blob:') &&
          !serverKeySet.has(image.key),
      )

      // Server cache ещё не догнал успешный upload — не затираем локальный результат
      if (optimisticUploads.length > 0) {
        return [...serverImages, ...optimisticUploads]
      }

      const serverKeys = serverImages.map(image => image.key).join('|')
      const prevServerKeys = prev.map(image => image.key).join('|')

      if (serverKeys === prevServerKeys && prev.length === serverImages.length) {
        return prev
      }

      return serverImages
    })
  }, [task, files.length, kind])

  const handleRemoveImage = async (key: string) => {
    const photo = images.find(
      image => image.key === key || image.localId === key,
    )
    if (!photo) return

    if (isLocalPreview(photo)) {
      revokeLocalPhotoUrl(photo)
      setImages(prev =>
        prev.filter(
          image => image.key !== photo.key && image.localId !== photo.localId,
        ),
      )

      if (photo.localId) {
        setFiles(prev => prev.filter(file => file.localId !== photo.localId))
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

  const handleRetryLocal = async (localId: string) => {
    const item = files.find(file => file.localId === localId)
    if (!item || !task || !canEditMedia) return

    if (!item.prepared) {
      setImages(prev =>
        patchPhotoByLocalId(prev, localId, {
          uploadStatus: 'preparing',
          uploadError: undefined,
        }),
      )

      try {
        const prepared = await prepareLocalMediaFile(item)
        const previewUrl = URL.createObjectURL(prepared.file)

        setFiles(prev =>
          prev.map(file => (file.localId === localId ? prepared : file)),
        )
        setImages(prev =>
          prev.map(image => {
            if (image.localId !== localId) return image
            revokeLocalPhotoUrl(image)
            return {
              ...image,
              url: previewUrl,
              mimeType: prepared.file.type,
              size: String(prepared.file.size),
              uploadStatus: 'ready',
              uploadProgress: 0,
              uploadError: undefined,
            }
          }),
        )
      } catch (error) {
        setImages(prev =>
          patchPhotoByLocalId(prev, localId, {
            uploadStatus: 'error',
            uploadError:
              error instanceof Error
                ? error.message
                : 'Не удалось подготовить файл',
          }),
        )
      }
      return
    }

    setImages(prev =>
      patchPhotoByLocalId(prev, localId, {
        uploadStatus: 'uploading',
        uploadProgress: 0,
        uploadError: undefined,
      }),
    )

    try {
      const uploads = await uploadMedia({
        taskId: task.id,
        files: [item],
        kind,
        callbacks: {
          onFileProgress: (id, progress) => {
            setImages(prev =>
              patchPhotoByLocalId(prev, id, { uploadProgress: progress }),
            )
          },
        },
      })

      const uploaded = uploads[0]
      if (!uploaded) return

      setFiles(prev => prev.filter(file => file.localId !== localId))
      setImages(prev => {
        const removed = prev.find(image => image.localId === localId)
        if (removed) revokeLocalPhotoUrl(removed)

        return [
          ...prev.filter(image => image.localId !== localId),
          {
            id: uploaded.key,
            url: uploaded.url,
            key: uploaded.key,
            mimeType: uploaded.mimeType,
            size: String(uploaded.size),
            filename: uploaded.fileName ?? undefined,
          },
        ]
      })
    } catch (error) {
      setImages(prev =>
        patchPhotoByLocalId(prev, localId, {
          uploadStatus: 'error',
          uploadError:
            error instanceof Error ? error.message : 'Не удалось загрузить файл',
        }),
      )
    }
  }

  const handleSaveMedia = async () => {
    if (!task || !canEditMedia || files.length === 0) return
    if (hasPreparingMedia(images)) return

    const readyFiles = files.filter(file => file.prepared)
    if (!readyFiles.length) return

    const succeeded = new Set<string>()

    const uploads = await uploadMedia({
      taskId: task.id,
      files: readyFiles,
      kind,
      callbacks: {
        onFileStart: localId => {
          setImages(prev =>
            patchPhotoByLocalId(prev, localId, {
              uploadStatus: 'uploading',
              uploadProgress: 0,
              uploadError: undefined,
            }),
          )
        },
        onFileProgress: (localId, progress) => {
          setImages(prev =>
            patchPhotoByLocalId(prev, localId, { uploadProgress: progress }),
          )
        },
        onFileSuccess: localId => {
          succeeded.add(localId)
        },
        onFileError: (localId, error) => {
          setImages(prev =>
            patchPhotoByLocalId(prev, localId, {
              uploadStatus: 'error',
              uploadError: error.message,
            }),
          )
        },
      },
    })

    const uploadedPhotos: Photo[] = uploads.map(upload => ({
      id: upload.key,
      url: upload.url,
      key: upload.key,
      mimeType: upload.mimeType,
      size: String(upload.size),
      filename: upload.fileName ?? undefined,
    }))

    setFiles(prev => prev.filter(file => !succeeded.has(file.localId)))
    setImages(prev => {
      const next: Photo[] = []

      prev.forEach(photo => {
        if (photo.localId && succeeded.has(photo.localId)) {
          revokeLocalPhotoUrl(photo)
          return
        }
        next.push(photo)
      })

      const serverAndFailed = next.filter(
        photo => !photo.localId || !succeeded.has(photo.localId),
      )

      return [
        ...serverAndFailed.filter(photo => !photo.localId),
        ...uploadedPhotos,
        ...serverAndFailed.filter(photo => Boolean(photo.localId)),
      ]
    })
  }

  const handleCancel = () => {
    images.filter(isLocalPreview).forEach(revokeLocalPhotoUrl)
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
    handleRetryLocal,
  }
}
