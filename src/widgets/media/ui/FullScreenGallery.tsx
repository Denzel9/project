import { Close } from '@mui/icons-material'
import {
  Box,
  Dialog,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
} from '@mui/material'
import { useEffect, useState, type MouseEvent } from 'react'

import { BigMedia } from './BigMedia'
import { Trumbnail } from './Trumbnail'

import type { MediaItemType } from '../model/types'
import type { Swiper as SwiperType } from 'swiper/types'

type FullScreenGalleryProps = {
  isOpen: boolean
  onClose: () => void
  items: MediaItemType[]
  initialSlide?: number
  /** phone — портретный просмотр в макете телефона (для отчётов) */
  variant?: 'default' | 'phone'
  /** @deprecated derived internally; kept for call-site compatibility */
  isMobile?: boolean
}

type PhoneDisplayMode = 'phone' | 'gallery'

export const FullScreenGallery = ({
  items,
  isOpen,
  onClose,
  initialSlide = 0,
  variant = 'default',
}: FullScreenGalleryProps) => {
  const isDesktop = useMediaQuery(theme => theme.breakpoints.up('md'), {
    defaultMatches: true,
    noSsr: true,
  })
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const [activeIndex, setActiveIndex] = useState(initialSlide)
  const [phoneViewerKey, setPhoneViewerKey] = useState(0)
  const [phoneDisplayMode, setPhoneDisplayMode] =
    useState<PhoneDisplayMode>('phone')

  const canUsePhone = variant === 'phone' && isDesktop
  const showPhoneFrame = canUsePhone && phoneDisplayMode === 'phone'
  const isMobile = !isDesktop

  useEffect(() => {
    if (!isOpen) return
    setTimeout(() => {
      setActiveIndex(initialSlide)
      setPhoneViewerKey(key => key + 1)
      setPhoneDisplayMode('phone')
    }, 0)
  }, [isOpen, initialSlide])

  const handleClose = () => {
    setThumbsSwiper(null)
    onClose()
  }

  const handlePhoneDotClick = (index: number) => {
    if (index === activeIndex) return
    setActiveIndex(index)
    setPhoneViewerKey(key => key + 1)
  }

  const handleDisplayMode = (
    _: MouseEvent<HTMLElement>,
    value: PhoneDisplayMode | null,
  ) => {
    if (!value) return
    setPhoneDisplayMode(value)
    if (value === 'phone') {
      setPhoneViewerKey(key => key + 1)
    }
  }

  if (!items.length) {
    return null
  }

  const displayModeToggle = (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={phoneDisplayMode}
      onChange={handleDisplayMode}
      aria-label="Режим отображения"
      sx={{
        bgcolor: 'rgba(0, 0, 0, 0.45)',
        borderRadius: '12px',
        p: 0.25,
        '& .MuiToggleButton-root': {
          color: 'rgba(255,255,255,0.72)',
          border: 0,
          borderRadius: '10px !important',
          px: 1.5,
          py: 0.5,
          textTransform: 'none',
          fontSize: '0.8125rem',
          fontWeight: 600,
          '&.Mui-selected': {
            color: 'common.white',
            bgcolor: 'rgba(255,255,255,0.18)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.24)',
            },
          },
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.12)',
          },
        },
      }}
    >
      <ToggleButton value="phone">Телефон</ToggleButton>
      <ToggleButton value="gallery">Галерея</ToggleButton>
    </ToggleButtonGroup>
  )

  if (showPhoneFrame) {
    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth={false}
        slotProps={{
          backdrop: {
            sx: { bgcolor: 'rgba(15, 23, 42, 0.72)' },
          },
          transition: {
            onExited: () => setThumbsSwiper(null),
          },
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center',
          },
          '& .MuiDialog-paper': {
            outline: 'none',
            overflow: 'visible',
            position: 'relative',
            m: 2,
            width: 'auto',
            maxWidth: '100%',
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <IconButton
          aria-label="Закрыть"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: -8,
            right: -44,
            zIndex: 3,
            width: 40,
            height: 40,
            bgcolor: 'rgba(0, 0, 0, 0.55)',
            color: 'common.white',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <Close sx={{ fontSize: 22 }} />
        </IconButton>

        <Stack spacing={1.5} sx={{ maxHeight: '92vh', alignItems: 'center' }}>
          <Box
            sx={{
              position: 'relative',
              width: 360,
              height: 'min(82vh, 780px)',
              aspectRatio: '9 / 16',
              maxWidth: 'min(360px, calc(82vh * 9 / 16))',
              p: '12px',
              borderRadius: '44px',
              bgcolor: '#0b0f14',
              boxShadow:
                '0 28px 80px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
              boxSizing: 'border-box',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 22,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                width: 110,
                height: 30,
                borderRadius: 999,
                bgcolor: '#05070a',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                pointerEvents: 'none',
              }}
            />

            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: '34px',
                overflow: 'hidden',
                bgcolor: 'common.black',
                '& .swiper-slide': {
                  borderRadius: '0 !important',
                },
                '& img, & video': {
                  borderRadius: '0 !important',
                },
              }}
            >
              <BigMedia
                key={phoneViewerKey}
                isDialog
                isGalleryOpen={isOpen}
                items={items}
                initialSlide={activeIndex}
                thumbsSwiper={null}
                showPagination={false}
                showNavigation={false}
                fit="cover"
                handleClickOpen={() => undefined}
                onActiveIndexChange={setActiveIndex}
              />
            </Box>

            <Box
              sx={{
                position: 'absolute',
                bottom: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 2,
                width: 120,
                height: 4,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.35)',
                pointerEvents: 'none',
              }}
            />
          </Box>

          <Stack spacing={1.25} sx={{ alignItems: 'center', width: '100%' }}>
            {items.length > 1 && (
              <Stack
                direction="row"
                spacing={0.75}
                sx={{
                  px: 1,
                  maxWidth: 360,
                  flexWrap: 'wrap',
                  rowGap: 0.75,
                  justifyContent: 'center',
                }}
              >
                {items.map((item, index) => (
                  <Box
                    key={item.url}
                    component="button"
                    type="button"
                    aria-label={`Слайд ${index + 1}`}
                    onClick={() => handlePhoneDotClick(index)}
                    sx={{
                      width: 8,
                      height: 8,
                      p: 0,
                      border: 0,
                      flexShrink: 0,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      bgcolor:
                        index === activeIndex
                          ? 'common.white'
                          : 'rgba(255,255,255,0.35)',
                      transition: 'background-color 0.2s ease',
                    }}
                  />
                ))}
              </Stack>
            )}

            {displayModeToggle}
          </Stack>
        </Stack>
      </Dialog>
    )
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
        spacing={1.5}
        sx={{
          width: '100%',
          height: '100%',
          p: { xs: 1, md: 2 },
          pt: { xs: 5, md: 2 },
          boxSizing: 'border-box',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1, md: 2 }}
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
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
              initialSlide={activeIndex}
              thumbsSwiper={thumbsSwiper}
              handleClickOpen={handleClose}
              onActiveIndexChange={setActiveIndex}
            />
          </Box>
        </Stack>

        {canUsePhone && (
          <Box sx={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
            {displayModeToggle}
          </Box>
        )}
      </Stack>
    </Dialog>
  )
}
