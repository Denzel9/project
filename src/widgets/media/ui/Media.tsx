import { Stack } from '@mui/material';
import { useState } from 'react';

import { BigImage } from './BigImage';
import { FullScreenGallery } from './FullScreenGallery';
import { Trumbnail } from './Trumbnail';

import type { Swiper } from 'swiper/types';

const images = [
  'caudalie.webp',
  'auth.webp',
  'caudalie.webp',
  'auth.webp',
  'caudalie.webp',
  'auth.webp',
  'caudalie.webp',
  'caudalie.webp',
  'auth.webp',
  'caudalie.webp',
];

type MediaProps = {
  width: number;
};

export const Media = ({ width }: MediaProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [thumbsSwiper, setThumbsSwiper] = useState<Swiper | null>(null);

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
        direction="row"
        sx={{
          height: 'fit-content',
          maxWidth: `${width + 100}px`,
          maxHeight: `${width}px`,
        }}
        onClick={e => e.preventDefault()}
      >
        <Trumbnail
          width={width}
          images={images}
          setThumbsSwiper={setThumbsSwiper}
        />

        <BigImage
          width={width}
          images={images}
          thumbsSwiper={thumbsSwiper}
          handleClickOpen={handleOpenDialog}
        />
      </Stack>

      <FullScreenGallery
        initialSlide={thumbsSwiper?.clickedIndex}
        images={images}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
};
