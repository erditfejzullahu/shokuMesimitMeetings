"use client";
import React, { ReactNode, useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";

const socket = io("https://localhost:3001");

const Layout = ({ children }: { children: ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

  useEffect(() => {
    const initializeMediasoup = async () => {
      try {
        setConnectionStatus("Initializing Mediasoup...");

        // Create the Mediasoup device
        const device = new mediasoupClient.Device();

        // Request router RTP capabilities from the server
        const rtpCapabilities = await new Promise<any>((resolve) => {
          socket.emit("getRouterRtpCapabilities", {}, resolve);
        });

        // Load the device with the router capabilities
        await device.load({ routerRtpCapabilities: rtpCapabilities });

        setConnectionStatus("Mediasoup Device Loaded");

        // Create WebRTC transport
        const transportInfo = await new Promise<any>((resolve) => {
          socket.emit("createWebRtcTransport", {}, resolve);
        });

        const sendTransport = device.createSendTransport(transportInfo);

        // Handle transport connection
        sendTransport.on("connect", async ({ dtlsParameters }, callback, errback) => {
          try {
            await new Promise<void>((resolve, reject) => {
              socket.emit("connectTransport", { transportId: sendTransport.id, dtlsParameters }, (response: any) => {
                if (response?.error) {
                  reject(response.error);
                } else {
                  resolve();
                }
              });
            });
            callback();
            setConnectionStatus("Transport Connected");
          } catch (error) {
            errback(error);
            setConnectionStatus(`Error Connecting Transport: ${error.message}`);
          }
        });

        // Handle producing media
        sendTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
          try {
            socket.emit("produce", {
              transportId: sendTransport.id,
              kind,
              rtpParameters,
            }, ({ id }) => {
              callback({ id });
            });
          } catch (error) {
            errback(error);
            setConnectionStatus(`Error Producing Media: ${error.message}`);
          }
        });

        // Get media stream (video/audio)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        const videoTrack = stream.getVideoTracks()[0];
        const audioTrack = stream.getAudioTracks()[0];

        // Produce the video and audio tracks
        if (videoTrack) await sendTransport.produce({ track: videoTrack });
        if (audioTrack) await sendTransport.produce({ track: audioTrack });

        setConnectionStatus("Mediasoup Connected and Producing");

        console.log("Mediasoup connected and producing");
      } catch (error) {
        console.error("Error initializing Mediasoup", error);
        setConnectionStatus(`Error: ${error.message}`);
      }
    };

    initializeMediasoup();
  }, []);

  return (
    <>
      <div className="bg-gray-500">
        <h2>Test: Video + Audio</h2>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: "400px", border: "2px solid #000" }} />
        <div>
          <h3>Connection Status: {connectionStatus}</h3>
        </div>
      </div>
      {children}
    </>
  );
};

export default Layout;
