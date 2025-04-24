import React from 'react'
import ConnectionStatus from './ConnectionStatus';
import FullscreenButton from './FullscreenButton';

interface HeaderProps {
  meetingDetails: MeetingHeaderDetails | null
}
const Header = ({meetingDetails}: HeaderProps) => {
  // if(!meetingDetails) return null;
  return (
    <div className="flex justify-between items-center mb-4 h-[65px] rounded-md bg-mob-oBlack shadow-xl shadow-black p-4">
        <h2 className="text-white text-xl font-semibold">ShokuMesimit</h2>
        <div className="flex items-center space-x-4">
        <ConnectionStatus />
        <FullscreenButton />
        </div>
    </div>
  )
}

export default Header