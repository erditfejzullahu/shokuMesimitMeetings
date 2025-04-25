import React from 'react'
import ConnectionStatus from './ConnectionStatus';
import FullscreenButton from './FullscreenButton';
import { isMobile } from 'react-device-detect';
import Image from 'next/image';

interface HeaderProps {
  meetingDetails: MeetingHeaderDetails | null
}
const Header = ({meetingDetails}: HeaderProps) => {
  // if(!meetingDetails) return null;
  return (
    <header className="flex justify-between items-center mb-4 h-[65px] rounded-md bg-mob-oBlack shadow-xl shadow-black p-4">
        <Image src={"/assets/images/logo.png"} width={100} height={50} alt='logo' className="h-12 w-fit"/>
        {meetingDetails === null && (
          <h1 className="font-black text-xl text-white pointer-events-none">ShokuJuaj</h1>
        )}
        <div className="flex items-center gap-4">
        <ConnectionStatus />
        {!isMobile && <FullscreenButton />}
        </div>
    </header>
  )
}

export default Header