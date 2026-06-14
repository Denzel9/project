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
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
  errorMessage?: string;
  onLoad?: () => void;
  onError?: () => void;
};

const mediaStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
  transition: 'opacity 0.2s ease',
  objectFit: 'cover' as CSSProperties['objectFit'],
};

export const MediaItem = ({
  src,
  mimeType,
  alt = '',
  loading = 'lazy',
  errorMessage = 'Не удалось загрузить медиа',
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
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      {status === 'loading' && (
        <Skeleton
          variant="rounded"
          sx={{
            inset: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
            pointerEvents: 'none',
          }}
        />
      )}

      {kind === 'image' ? (
        <img
          src={src}
          alt={alt}
          ref={imgRef}
          loading={loading}
          style={mediaStyle}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <video
          src={src}
          controls
          playsInline
          ref={videoRef}
          preload="metadata"
          onError={handleError}
          onCanPlay={handleLoad}
          onLoadedData={handleLoad}
          className="swiper-no-swiping"
          onClick={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
          style={{
            ...mediaStyle,
            position: 'relative',
            zIndex: 1,
          }}
        />
      )}
    </Box>
  );
};
