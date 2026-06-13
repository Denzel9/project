import { Box, Skeleton, Typography } from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from 'react';

import { getMediaKind } from '../lib/getMediaKind';

type MediaItemProps = {
  src: string;
  mimeType?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
  errorMessage?: string;
  borderRadius?: number | string;
  objectFit?: CSSProperties['objectFit'];
  onLoad?: () => void;
  onError?: () => void;
};

const mediaStyle = (
  width: MediaItemProps['width'],
  height: MediaItemProps['height'],
  objectFit: CSSProperties['objectFit'],
  borderRadius: MediaItemProps['borderRadius'],
  style?: CSSProperties,
): CSSProperties => ({
  width,
  height,
  objectFit,
  borderRadius,
  transition: 'opacity 0.2s ease',
  ...style,
});

export const MediaItem = ({
  src,
  mimeType,
  alt = '',
  width,
  height,
  style,
  loading = 'lazy',
  errorMessage = 'Не удалось загрузить медиа',
  borderRadius,
  objectFit = 'cover',
  onLoad,
  onError,
}: MediaItemProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  );

  const kind = getMediaKind(src, mimeType);

  const handleLoad = () => {
    setStatus('loaded');
    onLoad?.();
  };

  const handleError = () => {
    setStatus('error');
    onError?.();
  };

  useEffect(() => {
    if (kind === 'image') {
      const img = imgRef.current;

      if (img?.complete && img.naturalWidth > 0) {
        setStatus('loaded');
        onLoad?.();
      }

      return;
    }

    const video = videoRef.current;

    if (video && video.readyState >= 2) {
      setStatus('loaded');
      onLoad?.();
    }
  }, [src, mimeType, kind, onLoad]);

  if (status === 'error') {
    return (
      <Box
        sx={{
          p: 1,
          width,
          height,
          borderRadius,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'action.hover',
          justifyContent: 'center',
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
    );
  }

  return (
    <Box
      sx={{
        width,
        height,
        position: 'relative',
        minWidth: style?.minWidth,
        minHeight: style?.minHeight,
      }}
    >
      {status === 'loading' && (
        <Skeleton
          variant="rounded"
          sx={{
            inset: 0,
            borderRadius,
            width: '100%',
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
          }}
        />
      )}

      {kind === 'image' ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          style={mediaStyle(width, height, objectFit, borderRadius, style)}
        />
      ) : (
        <video
          ref={videoRef}
          className="swiper-no-swiping"
          src={src}
          controls
          playsInline
          preload="metadata"
          onLoadedData={handleLoad}
          onCanPlay={handleLoad}
          onError={handleError}
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          style={{
            ...mediaStyle(width, height, objectFit, borderRadius, style),
            position: 'relative',
            zIndex: 1,
          }}
        />
      )}
    </Box>
  );
};
