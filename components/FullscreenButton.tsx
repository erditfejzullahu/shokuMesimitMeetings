"use client"
import React, { useState } from 'react'
import { isMobile } from 'react-device-detect'
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

const FullscreenButton = () => {
    const [isFullscreen, setIsFullscreen] = useState(false)

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    };

  return (
    <button 
        onClick={toggleFullscreen}
        className="bg-mob-secondary cursor-pointer border border-black-200 shadow-xl shadow-black hover:opacity-50 text-white font-semibold px-4 py-2 rounded-md"
    >
        {isMobile ? (
            (isFullscreen ? <MdFullscreenExit /> : <MdFullscreen />)
        ) : (
            (isFullscreen ? "Largo ekranin e plote" : "Ekran i plote")
        )}
    </button>
  )
}

export default FullscreenButton