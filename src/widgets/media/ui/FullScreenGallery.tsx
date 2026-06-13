import { Close } from '@mui/icons-material';
import { Dialog, IconButton, Stack, Box } from '@mui/material';
import { useState } from 'react';

import { BigMedia } from './BigMedia';
import { Trumbnail } from './Trumbnail';

import type { MediaItemType } from '../model/types';
import type { Swiper as SwiperType } from 'swiper/types';

type FullScreenGalleryProps = {
  isOpen: boolean;
  initialSlide?: number;
  items: MediaItemType[];
  onClose: () => void;
};

export const FullScreenGallery = ({
  isOpen,
  initialSlide,
  items,
  onClose,
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
          maxWidth: '60%',
          maxHeight: '90%',
          overflow: 'visible',
          position: 'relative',
          borderRadius: '32px',
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
          ':hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        <Close />
      </IconButton>

      <Stack
        direction="row"
        sx={{
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 4, pt: 4 }}>
          <Trumbnail
            isFullscreen
            items={items}
            setThumbsSwiper={setThumbsSwiper}
          />
        </Box>

        <BigMedia
          isDialog
          isFullscreen
          initialSlide={initialSlide}
          items={items}
          thumbsSwiper={thumbsSwiper}
          handleClickOpen={handleClose}
        />
      </Stack>
    </Dialog>
  );
};
