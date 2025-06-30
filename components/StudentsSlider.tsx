'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { getSwiperConfig } from '@/utils/swiperConfig';
import 'swiper/css';
import 'swiper/css/pagination';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAllStudents } from '@/services/fetchingServices';
import Link from 'next/link';
import { Suspense } from 'react';
import SlidersLoadingComponent from './SlidersLoadingComponent';
import Image from 'next/image';

function StudentsSliderContent() {
  const {data: students} = useSuspenseQuery({
    queryKey: ['allStudents'],
    queryFn: getAllStudents
  })

  if(!students || students.length === 0){
    return <>
    <div className="flex-1 h-full flex items-center justify-center flex-col gap-1 py-14">
      <span className="font-bold text-xl">Nuk ka studente</span>
      <span className="text-gray-200 font-light text-sm">Nese mendoni qe eshte gabim, <Link href={"#"} className="text-mob-secondary font-medium">klikoni ketu</Link></span>
    </div>
    </>
  }

  const swiperConfig = getSwiperConfig(students.length);

  return (
    <div className="py-4 pt-8 px-4 rounded-xl">
      <h2 className="text-2xl font-normal text-white">Studente Aktive</h2>
      <Swiper
        {...swiperConfig}
        watchSlidesProgress={true}
        slideToClickedSlide={true}
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 4000, reverseDirection: true }}
        className="pb-12"
      >
        {students.map((student) => (
          <SwiperSlide key={student.id} className="pr-4">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-mob-oBlack border-4 border-black-200 rounded-xl p-6 shadow-xl my-10 mt-5 shadow-black h-full flex flex-col"
            >
              <div className="flex flex-row gap-4 items-center flex-1">
                <div className="max-w-20 max-h-20 w-full h-full rounded-full bg-gray-700 overflow-hidden mb-4 border-4 border-mob-secondary">
                  <Image 
                    src={student.profilePictureUrl} 
                    alt={student.name}
                    className=" w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                </div>
                <div>
                  <h3 title={student.name} className="text-lg font-bold text-white mb-1 line-clamp-1">{student.name}</h3>
                  <p title={student.email} className="text-gray-400 text-sm mb-3 line-clamp-1">{student.email}</p>
                </div>
              </div>
              
              <div className="flex justify-between w-full mt-4 text-sm">
                <div>
                  <p className="text-gray-400 text-sm font-semibold">Fillimi shfletimit</p>
                  <p className="text-white font-normal text-base">{new Date(student.createdAt).toLocaleDateString('sq-AL', {year: "numeric", day: "2-digit", month: "short"})}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold text-sm">Kurset</p>
                  <p className="text-white font-normal text-base">{student.coursesEnrolled}</p>
                </div>
              </div>
              
              <button className="mt-4 rounded-md border-4 border-black-200 bg-mob-primary px-4 py-2 font-medium cursor-pointer hover:bg-mob-oBlack transition-all duration-100">
                Shiko Profilin
              </button>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const StudentsSlider = () => {
  return (
    <Suspense fallback={<SlidersLoadingComponent />}>
      <StudentsSliderContent />
    </Suspense>
  )
}

export default StudentsSlider;