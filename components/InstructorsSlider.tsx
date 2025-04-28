'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { swiperConfig } from '@/utils/swiperConfig';
import 'swiper/css';
import 'swiper/css/pagination';

interface Instructor {
  id: number;
  name: string;
  expertise: string;
  bio: string;
  image: string;
  rating: number;
}

const instructors: Instructor[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    expertise: "Machine Learning",
    bio: "PhD in Computer Science with 10+ years of teaching experience.",
    image: "/instructor1.jpg",
    rating: 4.9
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    expertise: "Data Structures",
    bio: "Author of 3 textbooks on algorithms and data structures.",
    image: "/instructor2.jpg",
    rating: 4.8
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    expertise: "Web Development",
    bio: "Full-stack developer with industry experience at top tech firms.",
    image: "/instructor3.jpg",
    rating: 4.7
  },
  {
    id: 4,
    name: "Prof. David Kim",
    expertise: "Cybersecurity",
    bio: "Former security consultant with numerous certifications.",
    image: "/instructor4.jpg",
    rating: 4.9
  },
  {
    id: 5,
    name: "Prof. David Kim",
    expertise: "Cybersecurity",
    bio: "Former security consultant with numerous certifications.",
    image: "/instructor4.jpg",
    rating: 4.9
  },
];

export default function InstructorsSlider() {
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
          <SwiperSlide key={instructor.id} className="pl-4">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-mob-oBlack border-4 border-black-200 rounded-xl p-6 shadow-xl my-10 mt-4 shadow-black h-full flex flex-col relative"
            >
              <span className="absolute right-0 top-0 text-white font-semibold text-xs bg-mob-primary border-l-2 border-b-2 rounded-bl-xl rounded-tr-xl border-black-200 px-3 py-1.5"><span className="text-mob-secondary !font-bold">10</span> Kurse</span>
              <span className="absolute left-0 bottom-0 text-white font-semibold text-xs bg-mob-primary border-t-2 border-r-2 rounded-bl-xl rounded-tr-xl border-black-200 px-3 py-1.5"><span className="text-mob-secondary !font-bold">200</span> Studente</span>
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full border-4 border-mob-secondary overflow-hidden mr-4">
                  <img 
                    src={instructor.image} 
                    alt={instructor.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{instructor.name}</h3>
                  <p className="text-mob-secondary font-semibold text-sm">{instructor.expertise}</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4 flex-grow">{instructor.bio}</p>
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