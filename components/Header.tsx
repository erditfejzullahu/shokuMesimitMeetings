import React from 'react'
import ConnectionStatus from './ConnectionStatus';
import FullscreenButton from './FullscreenButton';

type Props = {
    title: string;
    isFullScreen: string;
}

const Header = ({title}: {title: string}) => {
    
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