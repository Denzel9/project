import {
  AddPhotoAlternateOutlined,
  DeleteOutlined,
  RefreshOutlined,
} from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material'
import {
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { hasVideoMedia, type LocalMediaFile } from '@/shared/lib/media'
import {
  FullScreenGallery,
  isGalleryMedia,
  MediaItem,
  UploadButton,
} from '@/widgets'

import type { Photo } from '@/entities/photo'

const MAX_IMAGES = 10
const DRAG_TYPE = 'GALLERY_IMAGE'

type DraggableImageProps = {
  image: Photo
  index: number
  images: Photo[]
  setImages: Dispatch<SetStateAction<Photo[]>>
  setDeletedFiles: (key: string) => void
  canDeleteImage: (image: Photo) => boolean
  canDrag: boolean
  moveImage: (fromIndex: number, toIndex: number) => void
  onRetryPrepare?: (localId: string) => void
  onOpen: (index: number) => void
}

type GalleryProps = {
  files: LocalMediaFile[]
  images: Photo[]
  mainImage?: string
  canUpload?: boolean
  setFiles: Dispatch<SetStateAction<LocalMediaFile[]>>
  setImages: Dispatch<SetStateAction<Photo[]>>
  setDeletedFiles: (key: string) => void
  canDeleteImage?: (image: Photo) => boolean
  onRetryPrepare?: (localId: string) => void
  onValidationError?: (message: string) => void
}

const tileSx = {
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '16px',
  overflow: 'hidden',
  position: 'relative',
  bgcolor: 'background.paper',
  border: '1px solid',
  borderColor: 'divider',
} as const

const UploadOverlay = ({
  image,
  onRetry,
}: {
  image: Photo
  onRetry?: () => void
}) => {
  const status = image.uploadStatus

  if (!status || status === 'ready') return null

  if (status === 'error') {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          px: 1,
          bgcolor: 'rgba(0,0,0,0.55)',
          color: 'common.white',
        }}
      >
        <Typography
          variant="caption"
          sx={{ textAlign: 'center', lineHeight: 1.2 }}
        >
          {image.uploadError || 'Ошибка'}
        </Typography>
        {onRetry && (
          <IconButton
            size="small"
            onClick={onRetry}
            sx={{ color: 'common.white' }}
          >
            <RefreshOutlined fontSize="small" />
          </IconButton>
        )}
      </Box>
    )
  }

  const label =
    status === 'preparing' ? 'Сжатие…' : `${image.uploadProgress ?? 0}%`

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.75,
        bgcolor: 'rgba(0,0,0,0.45)',
        color: 'common.white',
      }}
    >
      <CircularProgress
        size={28}
        variant={
          status === 'uploading' && image.uploadProgress
            ? 'determinate'
            : 'indeterminate'
        }
        value={image.uploadProgress ?? 0}
        sx={{ color: 'common.white' }}
      />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  )
}

const DraggableImage = ({
  image,
  index,
  images,
  setImages,
  moveImage,
  canDeleteImage,
  canDrag,
  setDeletedFiles,
  onRetryPrepare,
  onOpen,
}: DraggableImageProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const didDragRef = useRef(false)
  const canPreview = isGalleryMedia(image.mimeType, image.url)

  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPE,
    item: () => {
      didDragRef.current = false
      return { index }
    },
    canDrag,
    end: (_item, monitor) => {
      if (monitor.didDrop() || monitor.getDifferenceFromInitialOffset()) {
        didDragRef.current = true
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: DRAG_TYPE,
    canDrop: () => canDrag,
    drop: (draggedItem: { index: number }) => {
      if (!canDrag) return
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index)
        draggedItem.index = index
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  })

  const handleDelete = () => {
    setDeletedFiles(image.localId ?? image.key)
    setImages(
      images.filter(
        item => item.key !== image.key && item.localId !== image.localId,
      ),
    )
  }

  const handleOpen = () => {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }

    if (!canPreview || isDragging) return

    onOpen(index)
  }

  // eslint-disable-next-line react-hooks/refs
  drag(drop(ref))

  const showDelete =
    canDrag && canDeleteImage(image) && image.uploadStatus !== 'uploading'

  return (
    <Box
      ref={ref}
      onClick={handleOpen}
      sx={{
        ...tileSx,
        cursor: canDrag ? 'grab' : canPreview ? 'zoom-in' : 'default',
        opacity: isDragging ? 0.45 : 1,
        boxShadow: canDrag && isOver ? '0 0 0 2px' : 'none',
        borderColor: canDrag && isOver ? 'primary.main' : 'divider',
        transition:
          'opacity 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
        '&:active': {
          cursor: canDrag ? 'grabbing' : canPreview ? 'zoom-in' : 'default',
        },
      }}
    >
      {showDelete && (
        <IconButton
          size="small"
          aria-label="Удалить"
          onClick={event => {
            event.stopPropagation()
            handleDelete()
          }}
          sx={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 2,
            width: 28,
            height: 28,
            bgcolor: 'rgba(0, 0, 0, 0.55)',
            color: 'common.white',
            '&:hover': {
              bgcolor: 'error.main',
              color: 'common.white',
            },
          }}
        >
          <DeleteOutlined sx={{ fontSize: 16 }} />
        </IconButton>
      )}

      <UploadOverlay
        image={image}
        onRetry={
          image.uploadStatus === 'error' && image.localId && onRetryPrepare
            ? () => onRetryPrepare(image.localId!)
            : undefined
        }
      />

      <Box sx={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
        <MediaItem
          src={image.url}
          mimeType={image.mimeType}
          alt={image.key}
        />
      </Box>
    </Box>
  )
}

export const Gallery = ({
  files,
  setFiles,
  setDeletedFiles,
  images,
  setImages,
  canDeleteImage = () => true,
  canUpload = true,
  onRetryPrepare,
  onValidationError,
}: GalleryProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0)

  const canAddMore = canUpload && images.length < MAX_IMAGES
  const showVideoHint = hasVideoMedia(files)

  const galleryItems = useMemo(
    () =>
      images
        .filter(image => isGalleryMedia(image.mimeType, image.url))
        .map(image => ({
          url: image.url,
          mimeType: image.mimeType,
        })),
    [images],
  )

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return next
    })
  }

  const handleOpenGallery = (index: number) => {
    const image = images[index]
    if (!image || !isGalleryMedia(image.mimeType, image.url)) return

    const slideIndex = galleryItems.findIndex(item => item.url === image.url)
    if (slideIndex < 0) return

    setGalleryInitialSlide(slideIndex)
    setGalleryOpen(true)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <DndProvider backend={HTML5Backend}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: '24px',
            bgcolor: 'secondary.light',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(3, minmax(0, 1fr))',
                sm: 'repeat(4, minmax(0, 1fr))',
                md: 'repeat(5, minmax(0, 1fr))',
              },
              gap: 1.25,
            }}
          >
            {images.map((image, index) => (
              <DraggableImage
                key={image.localId ?? image.key}
                image={image}
                index={index}
                images={images}
                setImages={setImages}
                moveImage={moveImage}
                setDeletedFiles={setDeletedFiles}
                canDeleteImage={canDeleteImage}
                canDrag={canUpload}
                onRetryPrepare={onRetryPrepare}
                onOpen={handleOpenGallery}
              />
            ))}

            {canAddMore && (
              <Box
                component="label"
                sx={{
                  ...tileSx,
                  display: 'flex',
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'transparent',
                  borderStyle: 'dashed',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  transition:
                    'border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease',
                  '&:hover': {
                    color: 'primary.main',
                    borderColor: 'primary.main',
                    bgcolor: 'background.paper',
                  },
                }}
              >
                <Stack spacing={0.75} sx={{ alignItems: 'center', px: 1 }}>
                  <AddPhotoAlternateOutlined sx={{ fontSize: 28 }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      textAlign: 'center',
                      lineHeight: 1.2,
                    }}
                  >
                    Добавить
                  </Typography>
                </Stack>
                <UploadButton
                  images={images}
                  onChange={setImages}
                  files={files}
                  setFiles={setFiles}
                  maxCount={MAX_IMAGES}
                  onValidationError={onValidationError}
                />
              </Box>
            )}
          </Box>

          <Stack
            direction="row"
            sx={{
              mt: 1.25,
              px: 0.5,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography variant="caption" color="info">
              {showVideoHint
                ? 'Видео загружается без сжатия'
                : canUpload && images.length > 1
                  ? 'Перетащите, чтобы изменить порядок'
                  : ' '}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color:
                  images.length >= MAX_IMAGES
                    ? 'warning.main'
                    : 'text.secondary',
              }}
            >
              {images.length} из {MAX_IMAGES}
            </Typography>
          </Stack>
        </Box>
      </DndProvider>

      <FullScreenGallery
        isOpen={galleryOpen}
        isMobile={isMobile}
        items={galleryItems}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box>
  )
}
