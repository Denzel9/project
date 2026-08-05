import styled from '@emotion/styled'
import { useRef, type ChangeEvent, type Dispatch, type SetStateAction } from 'react'

import type { Photo } from '@/entities/photo'
import {
  createLocalMediaPlaceholders,
  prepareLocalMediaFiles,
  revokeLocalPhotoUrl,
  type LocalMediaFile,
  MEDIA_POST_ACCEPT,
} from '@/shared/lib/media'

interface UploadButtonProps {
  files: LocalMediaFile[]
  images?: Photo[]
  setFiles: Dispatch<SetStateAction<LocalMediaFile[]>>
  onChange?: Dispatch<SetStateAction<Photo[]>>
  onValidationError?: (message: string) => void
  maxCount?: number
}

const VisuallyHiddenInput = styled('input')({
  left: 0,
  width: 1,
  height: 1,
  bottom: 0,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
})

export const UploadButton = ({
  onChange,
  images = [],
  files,
  setFiles,
  onValidationError,
  maxCount = 10,
}: UploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (!selectedFiles.length) return

    const { placeholders, localFiles } = createLocalMediaPlaceholders(
      selectedFiles,
      files,
      {
        maxCount,
        currentCount: images.length,
        onValidationError,
      },
    )

    if (!localFiles.length) return

    setFiles(prev => [...prev, ...localFiles])
    onChange?.(prev => [...prev, ...placeholders])

    void prepareLocalMediaFiles(
      localFiles,
      (prepared, previewUrl) => {
        setFiles(prev =>
          prev.map(item =>
            item.localId === prepared.localId ? prepared : item,
          ),
        )

        onChange?.(prev =>
          prev.map(image => {
            if (image.localId !== prepared.localId) return image

            revokeLocalPhotoUrl(image)

            return {
              ...image,
              url: previewUrl,
              key: prepared.localId,
              mimeType: prepared.file.type,
              size: String(prepared.file.size),
              filename: prepared.file.name,
              uploadStatus: 'ready',
              uploadProgress: 0,
              uploadError: undefined,
            }
          }),
        )
      },
      (localId, error) => {
        onChange?.(prev =>
          prev.map(image =>
            image.localId === localId
              ? {
                  ...image,
                  uploadStatus: 'error',
                  uploadError: error.message,
                }
              : image,
          ),
        )
      },
    )
  }

  return (
    <VisuallyHiddenInput
      ref={inputRef}
      max={6}
      multiple
      type="file"
      accept={MEDIA_POST_ACCEPT}
      onChange={handleFileChange}
    />
  )
}
