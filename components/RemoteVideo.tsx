"use client"
import { useEffect, useRef } from "react";
import {isMobile} from "react-device-detect"

const RemoteVideo = ({ stream }: { stream: MediaStream }) => {
    const ref = useRef<HTMLVideoElement>(null);
  
    useEffect(() => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    }, [stream]);
  
    return (
      <video
        ref={ref}
        autoPlay
        muted
        playsInline
        style={{transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)"}}
        className={`w-auto h-full  object-cover rounded-xl`}
      />
    );
  };

export default RemoteVideo;