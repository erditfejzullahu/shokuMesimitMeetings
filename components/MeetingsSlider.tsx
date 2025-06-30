'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { getSwiperConfig } from '@/utils/swiperConfig';
import 'swiper/css';
import 'swiper/css/pagination';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAllOnlineMeetings } from '@/services/fetchingServices';
import Link from 'next/link';
import { Suspense } from 'react';
import SlidersLoadingComponent from './SlidersLoadingComponent';


function MeetingsSliderContent() {
  const {data: meetings, status} = useSuspenseQuery({
    queryKey: ['allMeetings'],
    queryFn: () => getAllOnlineMeetings()
  })  

  if(!meetings || meetings.length === 0){
    return <>
    <div className="flex-1 h-full flex items-center justify-center flex-col gap-1 py-14">
      <span className="font-bold text-xl">Nuk ka takime</span>
      <span className="text-gray-200 font-light text-sm">Nese mendoni qe eshte gabim, <Link href={"#"} className="text-mob-secondary font-medium">klikoni ketu</Link></span>
    </div>
    </>
  }

  const swiperConfig = getSwiperConfig(meetings.length);

  const getStatusColor = (status: MeetingStatus): string => {
    switch(status) {
      case "Nuk ka filluar ende": return 'bg-blue-600';
      case "Ka filluar": return 'bg-green-600';
      case "Nuk eshte mbajtur(Mungese Instruktori)": return 'bg-purple-600';
      case "Eshte anuluar": return "bg-red-700"
      case "Ka perfunduar": return "bg-black"
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="py-4 pt-8 px-4 rounded-xl">
      <h2 className="text-2xl font-normal text-white">Mbledhjet Online</h2>
      <Swiper
        {...swiperConfig}
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 3500 }}
        className="pb-12"
      >
        {meetings.map((meeting) => (
          <SwiperSlide key={meeting.id}>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-mob-oBlack border-4 border-black-200 rounded-xl p-6 shadow-xl my-10 mt-5 shadow-black h-full flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{meeting.title}</h3>
                <span className={`${getStatusColor(meeting.outputStatus)} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                  {meeting.outputStatus}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400">Data & Koha mbajtjes</p>
                <p className="text-white">{new Date(meeting.scheduleDateTime).toLocaleDateString("sq-AL", {year: "2-digit", month: "short", day: "2-digit"})} • {meeting.durationTime}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400">Instruktori</p>
                <p className="text-white">{meeting.instructorName}</p>
              </div>
              
              <div className="mt-auto">
                <p className="text-gray-400">Pjesemarresit</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-mob-secondary h-2.5 rounded-full" 
                    style={{ width: `${(meeting.registered / 35) * 100}%` }}
                  ></div>
                </div>
                <p className="text-white text-sm mt-1">{meeting.registered} registered</p>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

const MeetingsSlider = () => {
  return (
    <Suspense fallback={<div className="py-14"><SlidersLoadingComponent /></div>}>
      <MeetingsSliderContent />
    </Suspense>
  )
}

export default MeetingsSlider;