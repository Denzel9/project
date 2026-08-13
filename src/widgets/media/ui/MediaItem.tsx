import { Description } from '@mui/icons-material'
import { Box, Skeleton, Typography } from '@mui/material'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from 'react'

import { getMediaDisplayName, getMediaKind } from '../lib/getMediaKind'

export type MediaObjectFit = 'cover' | 'contain'

type MediaItemProps = {
  src: string
  alt?: string
  size?: number
  mimeType?: string
  fileName?: string
  isActive?: boolean
  onLoad?: () => void
  onError?: () => void
  errorMessage?: string
  withControls?: boolean
  /** Stretch document placeholder to fill a square tile */
  fill?: boolean
  /** cover — grids/thumbs; contain — main viewer / fullscreen */
  fit?: MediaObjectFit
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading']
}

export const MediaItem = ({
  src,
  onLoad,
  onError,
  alt = '',
  mimeType,
  fileName,
  loading = 'lazy',
  withControls = false,
  isActive = true,
  fit = 'cover',
  errorMessage = 'Не удалось загрузить медиа',
  fill = false,
}: MediaItemProps) => {
  const imgRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const onLoadRef = useRef(onLoad)
  const onErrorRef = useRef(onError)

  onLoadRef.current = onLoad
  onErrorRef.current = onError

  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  )

  const kind = getMediaKind(src, mimeType)
  const objectFit: CSSProperties['objectFit'] =
    withControls || fit === 'contain' ? 'contain' : 'cover'
  const showBlurBackdrop = fit === 'contain' && kind === 'image'

  const mediaStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: fit === 'contain' ? 0 : 16,
    transition: 'opacity 0.2s ease',
    objectFit,
    position: 'relative',
    zIndex: 1,
  }

  const handleLoad = () => {
    setStatus('loaded')
    onLoadRef.current?.()
  }

  const handleError = () => {
    setStatus('error')
    onErrorRef.current?.()
  }

  useEffect(() => {
    if (kind === 'document') return

    setStatus('loading')

    if (kind === 'image') {
      const img = imgRef.current

      if (img?.complete && img.naturalWidth > 0) {
        setStatus('loaded')
        onLoadRef.current?.()
      }

      return
    }

    const video = videoRef.current

    if (video && video.readyState >= 2) {
      setStatus('loaded')
      onLoadRef.current?.()
    }
  }, [src, mimeType, kind])

  useEffect(() => {
    if (kind !== 'video') return

    const video = videoRef.current

    if (!video || isActive) return

    video.pause()
  }, [isActive, kind])

  if (kind === 'document') {
    const displayName = getMediaDisplayName(fileName, src, mimeType)

    return (
      <Box
        href={src}
        component="a"
        target="_blank"
        rel="noopener noreferrer"
        onClick={event => event.stopPropagation()}
        sx={{
          gap: 1,
          p: 1.5,
          display: 'flex',
          width: '100%',
          height: fill ? '100%' : undefined,
          minHeight: fill ? 0 : 56,
          boxSizing: 'border-box',
          flexDirection: fill ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: fill ? 'center' : 'flex-start',
          textAlign: fill ? 'center' : 'left',
          borderRadius: fill ? 0 : '12px',
          textDecoration: 'none',
          color: 'text.primary',
          bgcolor: fill ? 'grey.50' : 'background.paper',
          border: fill ? 'none' : '1px solid',
          borderColor: 'divider',
          '&:hover': {
            bgcolor: fill ? 'action.hover' : 'secondary.main',
          },
        }}
      >
        <Description
          color="action"
          sx={fill ? { fontSize: 36, flexShrink: 0 } : undefined}
        />

        <Typography
          variant={fill ? 'caption' : 'body2'}
          title={displayName}
          sx={{
            minWidth: 0,
            width: fill ? '100%' : undefined,
            overflow: 'hidden',
            ...(fill
              ? {
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                }
              : {
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }),
          }}
        >
          {displayName}
        </Typography>
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'action.hover',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {errorMessage}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        bgcolor:
          fit === 'contain' || (kind === 'video' && withControls)
            ? 'common.black'
            : 'transparent',
      }}
    >
      {showBlurBackdrop && (
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: '-12%',
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(28px)',
            opacity: 0.45,
            transform: 'scale(1.08)',
            pointerEvents: 'none',
          }}
        />
      )}

      {status === 'loading' && (
        <Skeleton
          variant="rounded"
          sx={{
            inset: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {kind === 'image' ? (
        <img
          src={src}
          alt={alt}
          ref={imgRef}
          loading={loading}
          decoding="async"
          style={mediaStyle}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <video
          src={src}
          playsInline
          ref={videoRef}
          preload="metadata"
          onError={handleError}
          onCanPlay={handleLoad}
          controls={withControls}
          onLoadedData={handleLoad}
          className="swiper-no-swiping"
          onClick={event => event.stopPropagation()}
          onPointerDown={event => event.stopPropagation()}
          style={mediaStyle}
        />
      )}
    </Box>
  )
}
