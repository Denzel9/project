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
  isMobile?: boolean;
  initialSlide?: number;
  items: MediaItemType[];
  isFullscreen?: boolean;
  handleClickOpen: () => void;
  thumbsSwiper: SwiperType | null;
};

export const BigMedia = ({
  items,
  thumbsSwiper,
  handleClickOpen,
  initialSlide = 0,
  isMobile = false,
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
        height: '100%',
        width: isMobile ? '100%' : isFullscreen ? '100%' : '80%',
      }}
      onClick={handleClick}
    >
      {items?.map((item, index) => (
        <SwiperSlide
          key={item.url}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            borderRadius: '32px',
            position: 'relative',
          }}
        >
          <MediaItem
            src={item.url}
            mimeType={item.mimeType}
            alt={`Media ${index + 1}`}
            onLoad={() => handleImageReady(index)}
            onError={() => handleImageReady(index)}
            key={`${item.url}-${item.mimeType ?? ''}`}
            loading={index === initialSlide ? 'eager' : 'lazy'}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};
