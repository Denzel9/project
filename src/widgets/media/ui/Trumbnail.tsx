import { Box } from '@mui/material'
import { Thumbs } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import '../model/styles/style.css'

import { MediaItem } from './MediaItem'

import type { MediaItemType } from '../model/types'
import type { Swiper as SwiperType } from 'swiper/types'

type TrumbnailProps = {
  isMobile?: boolean
  items: MediaItemType[]
  isFullscreen?: boolean
  activeIndex?: number
  setThumbsSwiper: (swiper: SwiperType | null) => void
}

export const Trumbnail = ({
  items,
  setThumbsSwiper,
  isMobile = false,
  isFullscreen = false,
  activeIndex = 0,
}: TrumbnailProps) => {
  const thumbSize = isFullscreen ? 88 : 52

  return (
    <Swiper
      freeMode
      watchSlidesProgress
      slidesPerView="auto"
      spaceBetween={8}
      modules={[Thumbs]}
      direction={isMobile ? 'horizontal' : 'vertical'}
      onSwiper={setThumbsSwiper}
      className="media-thumbs-swiper"
      style={{
        width: isMobile ? '100%' : thumbSize,
        height: isMobile ? thumbSize : '100%',
        minHeight: thumbSize,
        minWidth: thumbSize,
        paddingLeft: isMobile ? 8 : 0,
        paddingRight: isMobile ? 8 : 0,
        boxSizing: 'border-box',
      }}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex

        return (
          <SwiperSlide
            key={item.url}
            style={{
              width: thumbSize,
              height: thumbSize,
              maxWidth: thumbSize,
              maxHeight: thumbSize,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                boxSizing: 'border-box',
                border: '2px solid',
                borderColor: isActive ? 'primary.main' : 'transparent',
                boxShadow: isActive
                  ? theme => `0 0 0 1px ${theme.palette.primary.main}`
                  : 'none',
                opacity: isActive ? 1 : 0.55,
                transition:
                  'opacity 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                '&:hover': {
                  opacity: 1,
                },
                '& img, & video': {
                  borderRadius: '10px !important',
                },
              }}
            >
              <MediaItem
                src={item.url}
                mimeType={item.mimeType}
                alt={`Thumbnail ${index + 1}`}
              />
            </Box>
          </SwiperSlide>
        )
      })}
    </Swiper>
  )
}
