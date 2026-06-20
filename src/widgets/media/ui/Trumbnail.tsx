import { Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import '../model/styles/style.css';

import { MediaItem } from './MediaItem';

import type { MediaItemType } from '../model/types';
import type { Swiper as SwiperType } from 'swiper/types';

type TrumbnailProps = {
  isMobile?: boolean;
  items: MediaItemType[];
  isFullscreen?: boolean;
  setThumbsSwiper: (swiper: SwiperType | null) => void;
};

export const Trumbnail = ({
  items,
  setThumbsSwiper,
  isMobile = false,
  isFullscreen = false,
}: TrumbnailProps) => {
  const getWidth = () => {
    if (isMobile) {
      return '100%';
    }

    if (isFullscreen) {
      return '100px';
    }

    return '50px';
  };

  const getHeight = () => {
    if (isMobile) {
      return '50px';
    }

    return '100%';
  };

  return (
    <Swiper
      freeMode
      slidesPerView={5}
      spaceBetween={5}
      modules={[Thumbs]}
      direction={isMobile ? 'horizontal' : 'vertical'}
      onSwiper={setThumbsSwiper}
      watchSlidesProgress
      style={{
        width: getWidth(),
        height: getHeight(),
        minHeight: '50px',
        minWidth: '50px',
        paddingLeft: isMobile ? '24px' : 0,
      }}
    >
      {items?.map((item, index) => (
        <SwiperSlide
          key={item.url}
          style={{
            minHeight: '50px',
            width: isMobile ? '50px' : 'auto',
            maxWidth: isMobile ? '50px' : 'auto',
            height: isFullscreen ? '100px' : '50px',
            maxHeight: isFullscreen ? '100px' : '50px',
          }}
        >
          <MediaItem
            src={item.url}
            mimeType={item.mimeType}
            alt={`Thumbnail ${index}`}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
