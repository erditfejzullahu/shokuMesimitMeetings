"use client"
import { useEffect, useRef } from "react";

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
        style={{ width: "400px", border: "2px solid blue", marginBottom: "1rem" }}
      />
    );
  };

export default RemoteVideo;