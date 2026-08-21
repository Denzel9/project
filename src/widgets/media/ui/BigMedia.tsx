import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Box } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Mousewheel, Navigation, Pagination, Thumbs } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import '../model/styles/style.css'
import { getMediaKind } from '../lib/getMediaKind'

import { MediaItem } from './MediaItem'

import type { MediaItemType } from '../model/types'
import type { Swiper as SwiperType } from 'swiper/types'

type BigMediaProps = {
  isDialog?: boolean
  isMobile?: boolean
  isGalleryOpen?: boolean
  initialSlide?: number
  items: MediaItemType[]
  handleClickOpen: () => void
  thumbsSwiper: SwiperType | null
  onActiveIndexChange?: (index: number) => void
  showPagination?: boolean
  showNavigation?: boolean
  fit?: 'cover' | 'contain'
}

export const BigMedia = ({
  items,
  isDialog = false,
  isMobile = false,
  isGalleryOpen = true,
  thumbsSwiper,
  handleClickOpen,
  initialSlide = 0,
  onActiveIndexChange,
  showPagination = true,
  showNavigation = true,
  fit = 'contain',
}: BigMediaProps) => {
  const loadingKey = `${items.map(item => item.url).join(',')}-${initialSlide}`
  const [readyKey, setReadyKey] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(initialSlide)
  const isLoading = items.length > 0 && readyKey !== loadingKey

  useEffect(() => {
    setTimeout(() => {
      setActiveIndex(initialSlide)
      onActiveIndexChange?.(initialSlide)
    }, 0)
  }, [initialSlide, items, onActiveIndexChange])

  const handleImageReady = useCallback(
    (index: number) => {
      if (index === initialSlide) {
        setReadyKey(loadingKey)
      }
    },
    [initialSlide, loadingKey],
  )

  const handleClick = () => {
    if (isDialog) {
      const item = items[activeIndex]

      if (item && getMediaKind(item.url, item.mimeType) === 'video') {
        return
      }

      handleClickOpen()
      return
    }

    handleClickOpen()
  }

  return (
    <Swiper
      loop={items.length > 1}
      slidesPerView={1}
      spaceBetween={10}
      preventClicks={false}
      mousewheel={!isLoading}
      lazyPreloadPrevNext={2}
      initialSlide={initialSlide}
      preventClicksPropagation={false}
      thumbs={{
        swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null,
      }}
      pagination={{
        clickable: true,
        enabled: showPagination && !isLoading && items.length > 1,
      }}
      navigation={showNavigation && !isLoading && items.length > 1}
      modules={[Thumbs, Pagination, Navigation, Mousewheel]}
      style={{
        height: '100%',
        width: '100%',
      }}
      onClick={handleClick}
      onSlideChange={swiper => {
        setActiveIndex(swiper.realIndex)
        onActiveIndexChange?.(swiper.realIndex)
      }}
    >
      {items.map((item, index) => {
        const isVideo = getMediaKind(item.url, item.mimeType) === 'video'
        const playInline = !isDialog && isMobile && isVideo
        const openFullscreenOnTap = !isDialog && !isMobile && isVideo

        return (
          <SwiperSlide
            key={item.url}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              borderRadius: '24px',
              position: 'relative',
            }}
          >
            <MediaItem
              src={item.url}
              mimeType={item.mimeType}
              alt={`Media ${index + 1}`}
              fit={fit}
              onLoad={() => handleImageReady(index)}
              onError={() => handleImageReady(index)}
              key={`${item.url}-${item.mimeType ?? ''}-${fit}`}
              loading={index === initialSlide ? 'eager' : 'lazy'}
              withControls={(isDialog || playInline) && isVideo}
              autoPlay={isDialog && isVideo}
              showPlayOverlay={openFullscreenOnTap}
              isActive={
                isGalleryOpen &&
                (playInline
                  ? activeIndex === index
                  : !isDialog || activeIndex === index)
              }
            />

            {openFullscreenOnTap && (
              <Box
                onClick={event => {
                  event.stopPropagation()
                  handleClickOpen()
                }}
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 3,
                  cursor: 'pointer',
                }}
              />
            )}
          </SwiperSlide>
        )
      })}
    </Swiper>
  )
}
