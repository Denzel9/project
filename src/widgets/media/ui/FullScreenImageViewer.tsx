import { Close } from '@mui/icons-material';
import { Box, Dialog, IconButton } from '@mui/material';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import type { MediaItemType } from '../model/types';

type FullScreenImageViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: MediaItemType[];
  initialSlide?: number;
};

export const FullScreenImageViewer = ({
  isOpen,
  onClose,
  items,
  initialSlide = 0,
}: FullScreenImageViewerProps) => {
  if (!items.length) {
    return null;
  }

  return (
    <Dialog
      fullScreen
      open={isOpen}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: 'common.black',
        },
      }}
    >
      <IconButton
        aria-label="Закрыть"
        onClick={onClose}
        sx={{
          top: 16,
          right: 16,
          zIndex: 10,
          position: 'fixed',
          color: 'common.white',
          bgcolor: 'rgba(0, 0, 0, 0.45)',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.65)',
          },
        }}
      >
        <Close />
      </IconButton>

      <Swiper
        navigation
        initialSlide={initialSlide}
        pagination={{ clickable: true }}
        modules={[Navigation, Pagination]}
        style={{ width: '100%', height: '100%' }}
      >
        {items.map(item => (
          <SwiperSlide key={item.url}>
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 6,
              }}
            >
              <Box
                component="img"
                src={item.url}
                alt=""
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </SwiperSlide>
        ))}
      </Swiper>
    </Dialog>
  );
};
