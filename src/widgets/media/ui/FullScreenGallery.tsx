import { Close } from '@mui/icons-material'
import { Box, Dialog, IconButton, Stack, useMediaQuery } from '@mui/material'
import { useState } from 'react'

import { BigMedia } from './BigMedia'
import { Trumbnail } from './Trumbnail'

import type { MediaItemType } from '../model/types'
import type { Swiper as SwiperType } from 'swiper/types'

type FullScreenGalleryProps = {
  isOpen: boolean
  onClose: () => void
  items: MediaItemType[]
  initialSlide?: number
  /** @deprecated derived internally; kept for call-site compatibility */
  isMobile?: boolean
}

export const FullScreenGallery = ({
  items,
  isOpen,
  onClose,
  initialSlide = 0,
}: FullScreenGalleryProps) => {
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('md'))
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(initialSlide)

  const handleClose = () => {
    setThumbsSwiper(null)
    onClose()
  }

  if (!items.length) {
    return null
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={false}
      slotProps={{
        transition: {
          onExited: () => setThumbsSwiper(null),
        },
      }}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'hidden',
          position: 'relative',
          m: { xs: 1, md: 3 },
          width: { xs: '100%', md: 'min(920px, 92vw)' },
          height: { xs: 'min(70vh, 560px)', md: 'min(88vh, 720px)' },
          maxWidth: '100%',
          borderRadius: { xs: '24px', md: '28px' },
          bgcolor: 'common.white',
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.28)',
        },
      }}
    >
      <IconButton
        aria-label="Закрыть"
        onClick={handleClose}
        sx={{
          position: 'absolute',
          top: { xs: 8, md: 12 },
          right: { xs: 8, md: 12 },
          zIndex: 3,
          width: 36,
          height: 36,
          bgcolor: 'rgba(0, 0, 0, 0.45)',
          color: 'common.white',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.6)',
          },
        }}
      >
        <Close sx={{ fontSize: 20 }} />
      </IconButton>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 1, md: 2 }}
        sx={{
          width: '100%',
          height: '100%',
          p: { xs: 1, md: 2 },
          pt: { xs: 5, md: 2 },
          boxSizing: 'border-box',
        }}
      >
        {!isMobile && items.length > 1 && (
          <Box
            sx={{
              width: 100,
              flexShrink: 0,
              height: '100%',
              minHeight: 0,
            }}
          >
            <Trumbnail
              isFullscreen
              items={items}
              activeIndex={activeIndex}
              setThumbsSwiper={setThumbsSwiper}
            />
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            borderRadius: '20px',
            overflow: 'hidden',
            bgcolor: 'grey.900',
          }}
        >
          <BigMedia
            isDialog
            isGalleryOpen={isOpen}
            items={items}
            initialSlide={initialSlide}
            thumbsSwiper={thumbsSwiper}
            handleClickOpen={handleClose}
            onActiveIndexChange={setActiveIndex}
          />
        </Box>
      </Stack>
    </Dialog>
  )
}
