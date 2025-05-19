"use client"
import React, { useEffect, useState } from 'react'
import { FaCircleInfo } from 'react-icons/fa6'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion';
import { MdClose } from 'react-icons/md'
import { BiSupport } from "react-icons/bi";
import { RxLapTimer } from "react-icons/rx";
import { TbPhotoVideo } from "react-icons/tb";
import { HiMiniDocumentChartBar } from "react-icons/hi2";
import CountdownTimer from './CountdownTimer'
import { GiDuration } from "react-icons/gi";
import { BiSolidCategory } from "react-icons/bi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { GoDiscussionClosed } from "react-icons/go";


const MeetingRightDetails = ({meetingDetails}: {meetingDetails: MeetingHeaderDetails}) => {
  const [informationsOpened, setInformationsOpened] = useState(false)
  const router = useRouter();
  
  useEffect(() => {
    if(informationsOpened){
      document.body.style.overflowY = "hidden"
    }else{
      document.body.style.overflowY = "auto"
    }
  }, [informationsOpened])
  

  const handleClose = (e: React.MouseEvent) => {
    if(e.target === e.currentTarget){
      setInformationsOpened(false)
    }
  }

  const formatDuration = () => {
    
    if(!meetingDetails.durationTime){
        return "Takim pa limit kohor"
    }
    if(meetingDetails.durationTime < 60){
        return (
            <>
                <span className="text-mob-secondary font-semibold text-sm">{meetingDetails.durationTime} <span className="text-white">minuta</span></span>
            </>
        )
    }else{
        const hours = meetingDetails.durationTime / 60;
        return (
            <>
                <span className="text-mob-secondary font-semibold text-sm">{hours}</span><span className="text-white"> ore</span>
            </>
        )
    }
  }

  const outputText = () => {
    if(meetingDetails?.status === "Nuk eshte mbajtur(Mungese Instruktori)"){
      return (
        <>
          <span className="text-white font-psemibold uppercase">Nuk eshte mbajtur <span className="text-mob-secondary">(Paraqisni ankese)</span></span>
          <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1">
            <BiSupport size={20} color='#ff9c01'/>
          </span>
        </>
      )
    }else if(meetingDetails?.status === "Eshte anuluar"){
      return (
        <>
          <span className="text-white font-psemibold uppercase">Eshte anuluar <span className="text-mob-secondary">(Paraqisni ankese)</span></span>
          <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1">
            <BiSupport size={20} color='#ff9c01'/>
          </span>
        </>
      )
    }else if(meetingDetails?.status === "Nuk ka filluar ende"){
      return (
        <>
          <CountdownTimer meetingData={meetingDetails}/>
          <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1">
            <RxLapTimer size={20} color='#ff9c01'/>
          </span>
        </>
      )
    }else if(meetingDetails?.status === "Ka filluar"){
      return (
      <>
        <span className="text-white font-psemibold uppercase">Duke u mbajtur</span>
        <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1">
          <TbPhotoVideo size={20} color='#ff9c01'/>
        </span>
      </>
      )
    }else if(meetingDetails?.status === "Ka perfunduar"){
      return (
        <>
          <span className="text-white font-psemibold uppercase">Shiko materialin</span>
          <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1">
            <HiMiniDocumentChartBar size={20} color='#ff9c01'/>
          </span>
        </>
      )
    }
  }

  const handleStatusOutputs = () => {
    console.log("handle status output here")
  }

  return (
    <>
    <button onClick={() => setInformationsOpened(true)} className="bg-gray-700 cursor-pointer hover:bg-gray-600 text-white p-3 rounded-full">
        <FaCircleInfo size={20}/>
    </button>
    {informationsOpened && <div onClick={handleClose} className="fixed w-full h-full left-0 top-0" style={{background: "rgba(0,0,0,0.4)"}}>
        <motion.div initial={{opacity: 0, y:0, x:50}} transition={{ duration: 0.5 }} animate={{opacity:1, y:0, x:0}} className="w-[80%] overflow-y-auto flex flex-col justify-between h-full bg-mob-primary border-l border-black-200 ml-auto max-w-[400px] shadow-2xl shadow-black">
          <div>
            <div className="p-4 relative w-fit mx-auto border-b border-black-200">
              <h2 className="font-semibold text-white text-xl text-center max-sm:text-lg">Detaje te takimit</h2>
              <Image src='/assets/images/path.png' width={100} height={30} alt='path' className="absolute right-0 bottom-2"/>
            </div>
            <div className="p-4 border-b border-black-200">
              <div className="flex flex-col gap-2">
                <div className="border rounded-md border-black-200 p-2 shadow-xl shadow-black bg-mob-oBlack">
                  <p className="text-gray-200 font-semibold text-sm">Titulli i takimit:</p>
                  <span className="text-mob-secondary font-semibold">{meetingDetails.title}</span>
                </div>
                {meetingDetails.description && (<div className="border rounded-md border-black-200 p-2 shadow-xl shadow-black bg-mob-oBlack">
                  <p className="text-gray-200 font-semibold text-sm">Pershkrimi i takimit:</p>
                  <span className="font-light text-sm !text-gray-400">{meetingDetails.description}</span>
                </div>)}
                <div className="border rounded-md border-black-200 p-2 shadow-xl shadow-black bg-mob-oBlack">
                  <p className="text-gray-200 font-semibold text-sm">Detaje tjera:</p>
                  <div className="flex flex-row gap-2 items-center flex-wrap">
                    <div className="bg-mob-primary border flex-1 border-black-200 rounded-md p-2 shadow-black shadow-xl mt-1 relative">
                      <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1"><GiDuration size={20} color='#ff9c01'/></span>
                      <span className="text-sm font-semibold text-white">Kohezgjatja:</span>
                      <p className="text-mob-secondary font-semibold text-sm">{formatDuration()}</p>
                    </div>
                    <div className="bg-mob-primary border flex-1 border-black-200 rounded-md p-2 shadow-black shadow-xl mt-1 relative">
                      <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1">
                        <BiSolidCategory size={20} color='#ff9c01'/>
                      </span>
                      <span className="text-sm font-semibold text-white">Kategoria:</span>
                      <p className="text-mob-secondary font-semibold text-sm">E pakategorizuar</p>
                    </div>
                  </div>
                  <div className="bg-mob-primary border flex-1 border-black-200 rounded-md p-2 shadow-black shadow-xl mt-3 relative">
                    <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1">
                        <FaChalkboardTeacher size={20} color='#ff9c01'/>
                    </span>
                    <span className="text-sm font-semibold text-white">Instruktori:</span>
                    <p className="text-mob-secondary font-semibold text-sm">{meetingDetails.instructor}</p>
                  </div>
                </div>

                {meetingDetails?.course && (<div className="border rounded-md border-black-200 p-2 shadow-xl shadow-black bg-mob-oBlack relative">
                  <span className="absolute top-0 right-0 bg-mob-primary shadow-lg shadow-black border-b border-l border-black-200 rounded-bl-md rounded-tr-md p-1">
                    <GoDiscussionClosed size={20} color='#ff9c01'/>
                  </span>
                  <p className="text-gray-200 font-semibold text-sm">Temat diskutuese:</p>
                  <div className="flex flex-row gap-2 items-center flex-wrap">
                    <div className="bg-mob-primary border flex-1 border-black-200 rounded-md p-2 shadow-black shadow-xl mt-1">
                      <div className="relative max-w-fit">
                        <span className="text-sm font-semibold text-white">{meetingDetails.course}</span>
                        {meetingDetails?.lesson && (<span className="text-mob-secondary font-semibold absolute left-6 -bottom-4 max-h-[22px] overflow-hidden">|</span>)}
                      </div>
                      {meetingDetails?.lesson && (<div className="mt-3 pl-4">
                        <span className="text-sm font-semibold text-white">{meetingDetails.lesson}</span>
                      </div>)}
                    </div>
                  </div>
                </div>)}

                <div onProgress={handleStatusOutputs} className="border rounded-md border-black-200 p-2 shadow-xl shadow-black bg-mob-oBlack relative hover:scale-[1.05] transition-all ease-in-out duration-300 cursor-pointer">
                  <p className="text-gray-200 font-semibold text-sm">Statusi takimit:</p>
                  <span className="text-mob-secondary font-semibold text-sm">{outputText()}</span>
                </div>

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
              onClick={() => router.replace('/')}
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