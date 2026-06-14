import { Close } from '@mui/icons-material';
import { Dialog, IconButton, Stack, Box } from '@mui/material';
import { useState } from 'react';

import { BigMedia } from './BigMedia';
import { Trumbnail } from './Trumbnail';

import type { MediaItemType } from '../model/types';
import type { Swiper as SwiperType } from 'swiper/types';

type FullScreenGalleryProps = {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  initialSlide?: number;
  items: MediaItemType[];
};

export const FullScreenGallery = ({
  items,
  isOpen,
  onClose,
  isMobile,
  initialSlide,
}: FullScreenGalleryProps) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  const handleClose = () => {
    setThumbsSwiper(null);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      sx={{
        '& .MuiDialog-paper': {
          outline: 'none',
          overflow: 'visible',
          position: 'relative',
          height: { xs: '50%', md: '100%' },
          borderRadius: { xs: '32px', md: '32px' },
          maxWidth: { xs: '100%', md: '60%' },
          maxHeight: { xs: '100%', md: '90%' },
        },
      }}
    >
      <IconButton
        onClick={handleClose}
        color="primary"
        sx={{
          top: 0,
          right: -70,
          position: 'absolute',
          bgcolor: 'secondary.main',
          display: { xs: 'none', md: 'block' },
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Stack
        direction="row"
        spacing={isMobile ? 0 : 2}
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'scroll',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            pl: { xs: 0, md: 4 },
            pt: { xs: 0, md: 4 },
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Trumbnail
            isFullscreen
            items={items}
            setThumbsSwiper={setThumbsSwiper}
          />
        </Box>

        <BigMedia
          isDialog
          items={items}
          initialSlide={initialSlide}
          thumbsSwiper={thumbsSwiper}
          handleClickOpen={handleClose}
        />
      </Stack>
    </Dialog>
  );
};
