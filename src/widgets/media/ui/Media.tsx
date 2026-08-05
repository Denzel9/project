import { Box, Stack, Typography, useMediaQuery } from '@mui/material'
import { useCallback, useState } from 'react'

import { BigMedia } from './BigMedia'
import { FullScreenGallery } from './FullScreenGallery'
import { Trumbnail } from './Trumbnail'

import type { MediaItemType } from '../model/types'
import type { SxProps, Theme } from '@mui/material'
import type { Swiper as SwiperType } from 'swiper/types'

type MediaProps = {
  items: MediaItemType[]
  /** Show side/bottom thumbnails when there is more than one item. Default true. */
  withThumbnails?: boolean
  /** Open fullscreen gallery on main slide click. Default true. */
  enableFullscreen?: boolean
  sx?: SxProps<Theme>
}

export const Media = ({
  items,
  withThumbnails = true,
  enableFullscreen = true,
  sx,
}: MediaProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false)

  const showThumbnails = withThumbnails && items.length > 1

  const handleOpenFullscreen = useCallback(() => {
    if (!enableFullscreen) return
    setIsFullscreenOpen(true)
  }, [enableFullscreen])

  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreenOpen(false)
  }, [])

  const handleThumbsSwiper = useCallback((swiper: SwiperType | null) => {
    setThumbsSwiper(swiper)
  }, [])

  if (!items.length) {
    return null
  }

  return (
    <Box
      sx={[
        {
          width: '100%',
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          position: 'relative',
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Stack
        spacing={{ xs: 1.25, md: 1.5 }}
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
        }}
      >
        {showThumbnails && (
          <Box
            sx={{
              flexShrink: 0,
              width: { xs: '100%', md: 56 },
              height: { xs: 56, md: '100%' },
              minHeight: { xs: 56, md: 0 },
            }}
          >
            <Trumbnail
              items={items}
              isMobile={isMobile}
              activeIndex={activeIndex}
              setThumbsSwiper={handleThumbsSwiper}
            />
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            bgcolor: 'common.black',
            cursor: enableFullscreen ? 'zoom-in' : 'default',
            '& .swiper-slide': {
              borderRadius: '24px',
            },
          }}
        >
          <BigMedia
            items={items}
            thumbsSwiper={showThumbnails ? thumbsSwiper : null}
            handleClickOpen={handleOpenFullscreen}
            onActiveIndexChange={setActiveIndex}
          />

          {items.length > 1 && (
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 2,
                px: 1,
                py: 0.35,
                borderRadius: '999px',
                bgcolor: 'rgba(0, 0, 0, 0.45)',
                color: 'common.white',
                fontWeight: 600,
                fontSize: '0.6875rem',
                letterSpacing: '0.02em',
                pointerEvents: 'none',
                backdropFilter: 'blur(4px)',
              }}
            >
              {activeIndex + 1} / {items.length}
            </Typography>
          )}
        </Box>
      </Stack>

      {enableFullscreen && (
        <FullScreenGallery
          items={items}
          isMobile={isMobile}
          isOpen={isFullscreenOpen}
          initialSlide={activeIndex}
          onClose={handleCloseFullscreen}
        />
      )}
    </Box>
  )
}
