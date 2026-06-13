import { Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import '../model/styles/style.css';

import { MediaItem } from './MediaItem';

import type { MediaItemType } from '../model/types';
import type { Swiper as SwiperType } from 'swiper/types';

type TrumbnailProps = {
  width?: number;
  items: MediaItemType[];
  isFullscreen?: boolean;
  setThumbsSwiper: (swiper: SwiperType | null) => void;
};

export const Trumbnail = ({
  width,
  items,
  setThumbsSwiper,
  isFullscreen = false,
}: TrumbnailProps) => {
  return (
    <Swiper
      freeMode
      slidesPerView={5}
      spaceBetween={5}
      modules={[Thumbs]}
      direction="vertical"
      onSwiper={setThumbsSwiper}
      watchSlidesProgress
      style={{
        width: isFullscreen ? '100px' : '50px',
        height: isFullscreen ? '100%' : `${width}px`,
      }}
    >
      {items?.map((item, index) => (
        <SwiperSlide
          key={item.url}
          className={
            isFullscreen
              ? 'thumbnail-slide-custom-fullscreen'
              : 'thumbnail-slide-custom'
          }
        >
          <MediaItem
            src={item.url}
            borderRadius="8px"
            mimeType={item.mimeType}
            alt={`Thumbnail ${index}`}
            style={{ cursor: 'pointer' }}
            width={isFullscreen ? '100px' : '50px'}
            height={isFullscreen ? '100px' : '50px'}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
