import { Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import '../model/styles/style.css';

import type { Swiper as SwiperType } from 'swiper/types';

type TrumbnailProps = {
  width?: number;
  images: string[];
  isFullscreen?: boolean;
  setThumbsSwiper: (swiper: SwiperType | null) => void;
};

export const Trumbnail = ({
  width,
  images,
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
      {images?.map((image, index) => (
        <SwiperSlide
          key={index}
          className={
            isFullscreen
              ? 'thumbnail-slide-custom-fullscreen'
              : 'thumbnail-slide-custom'
          }
        >
          <img
            src={image}
            alt={`Thumbnail ${index}`}
            style={{
              cursor: 'pointer',
              objectFit: 'cover',
              borderRadius: '8px',
              width: isFullscreen ? '100px' : '50px',
              height: isFullscreen ? '100px' : '50px',
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
