import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Mousewheel, Navigation, Pagination, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import '../model/styles/style.css';

import type { Swiper as SwiperType } from 'swiper/types';

type BigImageProps = {
  isDialog?: boolean;
  initialSlide?: number;
  width?: number;
  images: string[];
  isFullscreen?: boolean;
  thumbsSwiper: SwiperType | null;
  handleClickOpen: () => void;
};

export const BigImage = ({
  isDialog = false,
  initialSlide = 0,
  width,
  images,
  thumbsSwiper,
  handleClickOpen,
  isFullscreen = false,
}: BigImageProps) => {
  const handleClick = () => {
    if (isDialog) return;

    handleClickOpen();
  };
  return (
    <Swiper
      loop
      mousewheel
      slidesPerView={1}
      initialSlide={initialSlide}
      spaceBetween={10}
      lazyPreloadPrevNext={2}
      thumbs={{ swiper: thumbsSwiper }}
      pagination={{
        clickable: true,
      }}
      navigation
      modules={[Thumbs, Pagination, Navigation, Mousewheel]}
      style={{
        width: isFullscreen ? 'auto' : `${width}px`,
        height: isFullscreen ? 'auto' : `${width}px`,
        minWidth: `${width}px`,
        minHeight: `${width}px`,
      }}
      onClick={handleClick}
    >
      {images?.map((image, index) => (
        <SwiperSlide
          key={index}
          style={{
            position: 'relative',
            width: isFullscreen ? 'auto' : `${width}px`,
            height: isFullscreen ? 'auto' : `${width}px`,
            minWidth: `${width}px`,
            minHeight: `${width}px`,
            borderRadius: '32px',
            overflow: 'hidden',
            backgroundColor: 'red',
          }}
        >
          <img
            src={image}
            alt={`Application ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            style={{
              width: isFullscreen ? '100%' : `${width}px`,
              height: isFullscreen ? '100%' : `${width}px`,
              minWidth: `${width}px`,
              minHeight: `${width}px`,
              objectFit: 'cover',
              borderRadius: '32px',
            }}
          />
          <div className="swiper-lazy-preloader swiper-lazy-preloader-white" />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
