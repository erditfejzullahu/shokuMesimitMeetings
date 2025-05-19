import React from 'react'
import ConnectionStatus from './ConnectionStatus';
import FullscreenButton from './FullscreenButton';
import { isMobile } from 'react-device-detect';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderProps {
  meetingDetails: MeetingHeaderDetails | null
}
const Header = ({meetingDetails}: HeaderProps) => {
  // if(!meetingDetails) return null;
  
  return (
    <header className="flex justify-between items-center h-[65px] bg-mob-oBlack shadow-xl border-b border-black-200 shadow-black p-4">
        <Link href={"/"}><Image src={"/assets/images/logo.png"} width={100} height={50} alt='logo' className="h-12 w-fit"/></Link>
        {meetingDetails === null && (
          <div className="relative">
            <h1 className="font-black text-xl text-white pointer-events-none uppercase">Paneli i takimeve</h1>
            <Image src={"/assets/images/path.png"} width={100} height={50} alt='path' className="absolute -bottom-2 -right-4"/>
          </div>
        )}
        <div className="flex items-center gap-4">
        <ConnectionStatus />
        {!isMobile && <FullscreenButton />}
        </div>
    </header>
  )
}

export default Header