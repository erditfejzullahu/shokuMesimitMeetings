import { SwiperOptions } from 'swiper/types';

export const getSwiperConfig = (itemCount: number): SwiperOptions => {
  const baseConfig: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
      clickable: true,
    }
  };

  if(itemCount <= 1){
    return baseConfig;
  }

  return {
    ...baseConfig,
    breakpoints: {
      640: {
        slidesPerView: Math.min(2, itemCount),
      },
      1024: {
        slidesPerView: Math.min(3, itemCount),
      },
      1280: {
        slidesPerView: Math.min(4, itemCount),
      },  
    }
  }
};