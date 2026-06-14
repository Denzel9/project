import { Stack, useMediaQuery } from '@mui/material';
import { useState } from 'react';

import { theme } from '@/app/index';

import { BigMedia } from './BigMedia';
import { FullScreenGallery } from './FullScreenGallery';
import { Trumbnail } from './Trumbnail';

import type { MediaItemType } from '../model/types';
import type { Swiper } from 'swiper/types';

type MediaProps = {
  // width: number;
  items: MediaItemType[];
};

export const Media = ({ items }: MediaProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<Swiper | null>(null);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Stack
        spacing={2}
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{
          width: '100%',
          height: '100%',
        }}
      >
        <Trumbnail
          items={items}
          isMobile={isMobile}
          setThumbsSwiper={setThumbsSwiper}
        />

        <BigMedia
          items={items}
          thumbsSwiper={thumbsSwiper}
          handleClickOpen={handleOpenDialog}
        />
      </Stack>

      <FullScreenGallery
        items={items}
        isMobile={isMobile}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        initialSlide={thumbsSwiper?.clickedIndex}
      />
    </>
  );
};
