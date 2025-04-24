"use client"
import React, { useState } from 'react'
import { FaCircleInfo } from 'react-icons/fa6'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion';


const MeetingRightDetails = () => {
  const [informationsOpened, setInformationsOpened] = useState(false)
  const router = useRouter();

  const handleClose = (e: React.MouseEvent) => {
    if(e.target === e.currentTarget){
      setInformationsOpened(false)
    }
  }

  return (
    <>
    <button onClick={() => setInformationsOpened(true)} className="bg-gray-700 cursor-pointer hover:bg-gray-600 text-white p-3 rounded-full">
        <FaCircleInfo size={20}/>
    </button>
    {informationsOpened && <div onClick={handleClose} className="fixed w-full h-full left-0 top-0" style={{background: "rgba(0,0,0,0.4)"}}>
        <motion.div initial={{opacity: 0, y:20}} transition={{ duration: 0.5 }} animate={{opacity:1, y:0}} className="w-[80%] flex flex-col justify-between h-full bg-mob-primary border-l border-black-200 ml-auto max-w-[400px] shadow-2xl shadow-black">
          <div>
            <div className="p-4 relative w-fit mx-auto border-b border-black-200">
              <h2 className="font-semibold text-white text-xl text-center max-sm:text-lg">Detaje te takimit</h2>
              <Image src='/assets/images/path.png' width={100} height={30} alt='path' className="absolute right-0 bottom-2"/>
            </div>
            <div className="p-4 border-b border-black-200">
              <div className="flex flex-col gap-1">
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
              </div>
            </div>
            <div className="p-4 border-b border-black-200">
              <div className="flex flex-col gap-1">
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
              </div>
            </div>
            <div className="p-4 border-b border-black-200">
              <div className="flex flex-col gap-1">
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
                <p className="text-gray-200 font-normal text-sm">Titulli i takimit: <span className="text-white font-semibold">Titulli aktual</span></p>
              </div>
            </div>
          </div>
          <div className="p-4 ml-auto">
            <button 
              onClick={() => router.replace('/room')}
              className="border-2 font-semibold border-white px-4 py-2 rounded-md cursor-pointer bg-mob-oBlack hover:bg-mob-secondary transition-all duration-100 ease-in-out"
            >
              Dilni
            </button>
          </div>
        </motion.div>
    </div>}
    </>
  )
}

export default MeetingRightDetails