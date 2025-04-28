'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { swiperConfig } from '@/utils/swiperConfig';
import 'swiper/css';
import 'swiper/css/pagination';

type MeetingStatus = 'upcoming' | 'ongoing' | 'completed';

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  status: MeetingStatus;
  instructor: string;
  participants: number;
}

const meetings: Meeting[] = [
  {
    id: 1,
    title: "Advanced Algorithms",
    date: "2023-06-15",
    time: "14:00 - 16:00",
    status: "upcoming",
    instructor: "Prof. Michael Chen",
    participants: 24
  },
  {
    id: 2,
    title: "Web Dev Workshop",
    date: "2023-06-10",
    time: "10:00 - 12:00",
    status: "completed",
    instructor: "Dr. Emily Rodriguez",
    participants: 18
  },
  {
    id: 3,
    title: "ML Fundamentals",
    date: "2023-06-12",
    time: "09:00 - 11:00",
    status: "ongoing",
    instructor: "Dr. Sarah Johnson",
    participants: 32
  },
  {
    id: 4,
    title: "Security Principles",
    date: "2023-06-18",
    time: "13:00 - 15:00",
    status: "upcoming",
    instructor: "Prof. David Kim",
    participants: 15
  },
];

export default function MeetingsSlider() {
  const getStatusColor = (status: MeetingStatus): string => {
    switch(status) {
      case 'upcoming': return 'bg-blue-600';
      case 'ongoing': return 'bg-green-600';
      case 'completed': return 'bg-purple-600';
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
                <span className={`${getStatusColor(meeting.status)} text-white text-xs px-2 py-1 rounded-full`}>
                  {meeting.status}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400">Date & Time</p>
                <p className="text-white">{meeting.date} • {meeting.time}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-400">Instructor</p>
                <p className="text-white">{meeting.instructor}</p>
              </div>
              
              <div className="mt-auto">
                <p className="text-gray-400">Participants</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-mob-secondary h-2.5 rounded-full" 
                    style={{ width: `${(meeting.participants / 35) * 100}%` }}
                  ></div>
                </div>
                <p className="text-white text-sm mt-1">{meeting.participants} registered</p>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}