'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { getSwiperConfig } from '@/utils/swiperConfig';
import 'swiper/css';
import 'swiper/css/pagination';
import { Suspense, useState } from 'react';
import {useSuspenseQuery} from "@tanstack/react-query";
import { getAllInstructors } from '@/services/fetchingServices';
import LoadingComponent from './LoadingComponent';
import SlidersLoadingComponent from './SlidersLoadingComponent';
import Link from 'next/link';
import Image from 'next/image';


function InstructorsSliderContent() {
  const {data: instructors} = useSuspenseQuery({
    queryKey: ['instructors'],
    queryFn: getAllInstructors,
    refetchOnWindowFocus: false,
    retry: 2
    // staleTime: 600000
  })
  
  
  if(!instructors || instructors.length === 0){
    return <>
    <div className="flex-1 h-full flex items-center justify-center flex-col gap-1">
      <span className="font-bold text-xl">Nuk ka instruktore</span>
      <span className="text-gray-200 font-light text-sm">Nese mendoni qe eshte gabim, <Link href={"#"} className="text-mob-secondary font-medium">klikoni ketu</Link></span>
    </div>
    </>
  }
  const swiperConfig = getSwiperConfig(instructors.length)

  return (
    <div className="py-4 pt-8 px-4 rounded-xl">
      <h2 className="text-2xl font-normal text-white">Instruktoret tane</h2>
      <Swiper
        {...swiperConfig}
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 4000 }}
        className="pb-12"
      >
        {instructors.map((instructor) => (
          <SwiperSlide key={instructor.userId} className="pl-4">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-mob-oBlack border-4 border-black-200 rounded-xl p-6 shadow-xl my-10 mt-4 shadow-black h-full flex flex-col relative"
            >
              <span className="absolute right-0 top-0 text-white font-semibold text-xs bg-mob-primary border-l-2 border-b-2 rounded-bl-xl rounded-tr-xl border-black-200 px-3 py-1.5"><span className="text-mob-secondary !font-bold">{instructor.instructorCourses}</span> Kurse</span>
              <span className="absolute left-0 bottom-0 text-white font-semibold text-xs bg-mob-primary border-t-2 border-r-2 rounded-bl-xl rounded-tr-xl border-black-200 px-3 py-1.5"><span className="text-mob-secondary !font-bold">{instructor.instructorStudents}</span> Studente</span>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-mob-secondary overflow-hidden mr-4">
                  <Image 
                    src={instructor.profilePictureUrl} 
                    alt={instructor.instructorName}
                    className="w-full h-full object-cover"
                    width={200}
                    height={200}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white line-clamp-1" title={instructor.instructorName}>{instructor.instructorName}</h3>
                  <p className="text-mob-secondary font-semibold text-sm line-clamp-1" title={instructor.expertise}>{instructor.expertise}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 flex-grow line-clamp-2">{instructor.bio}</p>
              <div className="flex items-center flex-row justify-between">
                <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < Math.floor(instructor.rating) ? '★' : '☆'}</span>
                    ))}
                    </div>
                    <span className="text-white">{instructor.rating}</span>
                </div>
                <div>
                    <button className="rounded-md border-4 border-black-200 bg-mob-primary px-4 py-2 font-medium cursor-pointer hover:bg-mob-oBlack transition-all duration-100">Shiko me shume</button>
                </div>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default function InstructorsSlide() {
  return (
    <Suspense fallback={<SlidersLoadingComponent />}>
      <InstructorsSliderContent />
    </Suspense>
  )
}