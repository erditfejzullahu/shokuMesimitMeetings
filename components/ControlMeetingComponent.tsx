import React from 'react'
import * as mediasoupClient from "mediasoup-client";
import { FaCircleInfo, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa6';
import { LuScreenShare } from 'react-icons/lu';
import { isMobile } from 'react-device-detect';
import MeetingRightDetails from './MeetingRightDetails';


interface ControlProps {
    audioPaused: boolean | undefined;
    videoStreamReady: boolean;
    screenProducer: mediasoupClient.types.Producer | null;
    toggleProducerVideo: () => void
    toggleProducerAudio: () => void
    stopScreenShare: () => void;
    toggleScreenShare: () => void;
}
const ControlMeetingComponent = ({audioPaused, videoStreamReady, screenProducer, toggleProducerVideo, toggleProducerAudio, stopScreenShare, toggleScreenShare}: ControlProps) => {
    
  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
        <div className="bg-mob-oBlack rounded-full px-6 py-3 flex space-x-4 items-center shadow-[0_10px_40px_rgba(0,0,0)] border border-black-200">
            <button 
            className={`${audioPaused ? 'bg-gray-700' : 'bg-mob-secondary'} hover:bg-gray-600 text-white p-3 rounded-full cursor-pointer`} 
            onClick={toggleProducerAudio}
            >
            {audioPaused ? <FaMicrophoneSlash size={20}/> : <FaMicrophone size={20}/>}
            </button>
            
            <button 
            className={`${videoStreamReady ? 'bg-mob-secondary' : 'bg-gray-700'} hover:bg-gray-600 cursor-pointer text-white p-3 rounded-full`} 
            onClick={toggleProducerVideo}
            >
            {videoStreamReady ? <FaVideo size={20}/> : <FaVideoSlash size={20}/>}
            </button>
            
            <button 
            onClick={screenProducer ? stopScreenShare : toggleScreenShare} 
            className={`${screenProducer ? 'bg-mob-secondary hover:bg-gray-700' : 'bg-gray-700 hover:bg-mob-secondary'} cursor-pointer font-medium group text-white px-4 py-2 rounded-full flex items-center gap-1.5 flex-row`}
            >
            {!isMobile && screenProducer ? 'Stop Sharing' : 'Share Screen'}
            <LuScreenShare size={20} className={`${screenProducer ? 'text-white group-hover:text-mob-secondary' : 'text-mob-secondary group-hover:text-white'}`}/>
            </button>
            
            <MeetingRightDetails />
        </div>
    </div>
  )
}

export default ControlMeetingComponent