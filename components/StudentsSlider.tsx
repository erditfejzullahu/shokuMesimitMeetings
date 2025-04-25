'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { motion } from 'framer-motion';
import { swiperConfig } from '@/utils/swiperConfig';
import 'swiper/css';
import 'swiper/css/pagination';

interface Student {
  id: number;
  name: string;
  email: string;
  joined: string;
  courses: number;
  image: string;
}

const students: Student[] = [
  {
    id: 1,
    name: "Alex Turner",
    email: "alex.t@example.com",
    joined: "2023-01-15",
    courses: 4,
    image: "/student1.jpg"
  },
  {
    id: 2,
    name: "Jamie Smith",
    email: "jamie.s@example.com",
    joined: "2023-02-10",
    courses: 2,
    image: "/student2.jpg"
  },
  {
    id: 3,
    name: "Taylor Johnson",
    email: "taylor.j@example.com",
    joined: "2022-11-05",
    courses: 6,
    image: "/student3.jpg"
  },
  {
    id: 4,
    name: "Morgan Lee",
    email: "morgan.l@example.com",
    joined: "2023-03-22",
    courses: 3,
    image: "/student4.jpg"
  },
  {
    id: 5,
    name: "Casey Brown",
    email: "casey.b@example.com",
    joined: "2022-09-18",
    courses: 5,
    image: "/student5.jpg"
  },
];

export default function StudentsSlider() {
  return (
    <div className="py-4 pt-8 px-4 rounded-xl">
      <h2 className="text-2xl font-normal text-white">Studente Aktive</h2>
      <Swiper
        {...swiperConfig}
        modules={[Pagination, Autoplay]}
        autoplay={{ delay: 4000 }}
        className="pb-12"
      >
        {students.map((student) => (
          <SwiperSlide key={student.id}>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              className="bg-mob-oBlack border-4 border-black-200 rounded-xl p-6 shadow-xl my-10 mt-5 shadow-black h-full flex flex-col"
            >
              <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden mb-4 border-4 border-mob-secondary">
                <img 
                  src={student.image} 
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{student.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{student.email}</p>
              
              <div className="flex justify-between w-full mt-4 text-sm">
                <div>
                  <p className="text-gray-400 text-sm font-semibold">Joined</p>
                  <p className="text-white font-normal text-base">{student.joined}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-semibold text-sm">Courses</p>
                  <p className="text-white font-normal text-base">{student.courses}</p>
                </div>
              </div>
              
              <button className="mt-6 px-4 py-2 bg-mob-secondary hover:bg-mob-oBlack border-4 font-medium border-black-200 cursor-pointer text-white rounded-md transition-all duration-100">
                Shiko Profilin
              </button>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}