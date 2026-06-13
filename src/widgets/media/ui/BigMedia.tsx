import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useCallback, useState } from 'react';
import { Mousewheel, Navigation, Pagination, Thumbs } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import '../model/styles/style.css';

import { MediaItem } from './MediaItem';

import type { MediaItemType } from '../model/types';
import type { Swiper as SwiperType } from 'swiper/types';

type BigMediaProps = {
  isDialog?: boolean;
  initialSlide?: number;
  width?: number;
  items: MediaItemType[];
  isFullscreen?: boolean;
  thumbsSwiper: SwiperType | null;
  handleClickOpen: () => void;
};

export const BigMedia = ({
  width,
  items,
  thumbsSwiper,
  handleClickOpen,
  initialSlide = 0,
  isFullscreen = false,
}: BigMediaProps) => {
  const loadingKey = `${items.map(item => item.url).join(',')}-${initialSlide}`;
  const [readyKey, setReadyKey] = useState<string | null>(null);
  const isLoading = items.length > 0 && readyKey !== loadingKey;

  const handleImageReady = useCallback(
    (index: number) => {
      if (index === initialSlide) {
        setReadyKey(loadingKey);
      }
    },
    [initialSlide, loadingKey]
  );

  const handleClick = () => {
    handleClickOpen();
  };

  return (
    <Swiper
      loop
      mousewheel={!isLoading}
      preventClicks={false}
      preventClicksPropagation={false}
      slidesPerView={1}
      spaceBetween={10}
      lazyPreloadPrevNext={2}
      initialSlide={initialSlide}
      thumbs={{ swiper: thumbsSwiper }}
      pagination={{
        clickable: true,
        enabled: !isLoading,
      }}
      navigation={!isLoading}
      modules={[Thumbs, Pagination, Navigation, Mousewheel]}
      style={{
        minWidth: `${width}px`,
        minHeight: `${width}px`,
        width: isFullscreen ? 'auto' : `${width}px`,
        height: isFullscreen ? 'auto' : `${width}px`,
      }}
      onClick={handleClick}
    >
      {items?.map((item, index) => (
        <SwiperSlide
          key={item.url}
          style={{
            overflow: 'hidden',
            borderRadius: '32px',
            position: 'relative',
            minWidth: `${width}px`,
            minHeight: `${width}px`,
            width: isFullscreen ? 'auto' : `${width}px`,
            height: isFullscreen ? 'auto' : `${width}px`,
          }}
        >
          <MediaItem
            src={item.url}
            borderRadius="32px"
            mimeType={item.mimeType}
            alt={`Media ${index + 1}`}
            onLoad={() => handleImageReady(index)}
            onError={() => handleImageReady(index)}
            key={`${item.url}-${item.mimeType ?? ''}`}
            width={isFullscreen ? '100%' : `${width}px`}
            height={isFullscreen ? '100%' : `${width}px`}
            loading={index === initialSlide ? 'eager' : 'lazy'}
            style={{
              minWidth: `${width}px`,
              minHeight: `${width}px`,
            }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
