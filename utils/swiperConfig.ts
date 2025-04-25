import { SwiperOptions } from 'swiper/types';

export const swiperConfig: SwiperOptions = {
  slidesPerView: 1,
  spaceBetween: 20,
  pagination: {
    clickable: true,
  },
  breakpoints: {
    640: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
    1280: {
      slidesPerView: 4,
    },
  },
};