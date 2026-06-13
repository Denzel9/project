import { Stack } from '@mui/material';
import { useState } from 'react';

import { BigMedia } from './BigMedia';
import { FullScreenGallery } from './FullScreenGallery';
import { Trumbnail } from './Trumbnail';

import type { MediaItemType } from '../model/types';
import type { Swiper } from 'swiper/types';

type MediaProps = {
  width: number;
  items: MediaItemType[];
};

export const Media = ({ width, items }: MediaProps) => {
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
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Trumbnail
          width={width}
          items={items}
          setThumbsSwiper={setThumbsSwiper}
        />

        <BigMedia
          width={width}
          items={items}
          thumbsSwiper={thumbsSwiper}
          handleClickOpen={handleOpenDialog}
        />
      </Stack>

      <FullScreenGallery
        initialSlide={thumbsSwiper?.clickedIndex}
        items={items}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </>
  );
};
