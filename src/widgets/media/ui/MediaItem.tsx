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
  alt?: string;
  size?: number;
  mimeType?: string;
  isActive?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  errorMessage?: string;
  withControls?: boolean;
  loading?: ImgHTMLAttributes<HTMLImageElement>['loading'];
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
  onLoad,
  onError,
  alt = '',
  mimeType,
  loading = 'lazy',
  withControls = false,
  isActive = true,
  errorMessage = 'Не удалось загрузить медиа',
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

  useEffect(() => {
    if (kind !== 'video') return;

    const video = videoRef.current;

    if (!video || isActive) return;

    video.pause();
  }, [isActive, kind]);

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
        bgcolor:
          kind === 'video' && withControls ? 'common.black' : 'transparent',
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
          style={{
            ...mediaStyle,
            objectFit: withControls ? 'contain' : mediaStyle.objectFit,
            position: 'relative',
            zIndex: 1,
          }}
        />
      )}
    </Box>
  );
};
