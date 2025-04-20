"use client";
import React, { ReactNode, useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import RemoteVideo from "@/components/RemoteVideo";
import Image from "next/image";
import {FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash} from "react-icons/fa6"

const Layout = ({ children }: { children: ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStreamReady, setVideoStreamReady] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, {video?: MediaStream, audio?: MediaStream}>>({});
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioPaused, setAudioPaused] = useState<boolean | undefined>(false)

  const [producersState, setProducersState] = useState<mediasoupClient.types.Producer[]>([])

  useEffect(() => {
    const socket = io("https://onlinemeet.hajt24.xyz");
    let device: mediasoupClient.Device;
    let sendTransport: mediasoupClient.types.Transport;
    let recvTransport: mediasoupClient.types.Transport;
    let localStream: MediaStream;
    const producers: mediasoupClient.types.Producer[] = [];
    const consumers: mediasoupClient.types.Consumer[] = [];
    const addedProducers = new Set<string>();

    const initializeMediasoup = async () => {
      try {
        setConnectionStatus("Initializing Mediasoup...");
        
        // Load device
        device = new mediasoupClient.Device();
        const rtpCapabilities = await new Promise<any>((resolve) => {
          socket.emit("getRouterRtpCapabilities", {}, resolve);
        });
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        setConnectionStatus("Mediasoup Device Loaded");

        // Create transports
        const iceServers = [
          {
            urls: ['turn:158.101.170.230:3478'],
            username: 'erditi',
            credential: 'erditbaba'
          },
          {
            urls: ['stun:158.101.170.230:3478']
          }
        ];

        const [sendTransportInfo, recvTransportInfo] = await Promise.all([
          new Promise<any>((resolve) => 
            socket.emit("createWebRtcTransport", { type: "send" }, resolve)
          ),
          new Promise<any>((resolve) => 
            socket.emit("createWebRtcTransport", { type: "recv" }, resolve)
          )
        ]);

        sendTransport = device.createSendTransport({
          ...sendTransportInfo,
          iceServers,
          iceTransportPolicy: "all"
        });

        recvTransport = device.createRecvTransport({
          ...recvTransportInfo,
          iceServers,
          iceTransportPolicy: "all"
        });

        // Setup transport event handlers
        const setupTransport = (transport: mediasoupClient.types.Transport, type: string) => {
          transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
            try {
              await new Promise<void>((resolve, reject) => {
                socket.emit("connectTransport", {
                  transportId: transport.id,
                  dtlsParameters
                }, (response: any) => {
                  response?.error ? reject(response.error) : resolve();
                });
              });
              callback();
              setConnectionStatus(`${type} Transport Connected`);
            } catch (err: any) {
              errback(err);
              setConnectionStatus(`${type} Transport Error: ${err.message}`);
            }
          });

          transport.on("icecandidateerror", (event) => {
            console.log("ICE candidate error:", event);
          });
        };

        socket.emit("getProducers", async (producers: any[]) => {
          for (const { producerId, socketId, kind } of producers) {
            // same consume logic you already use
            if (addedProducers.has(producerId)) continue;
            addedProducers.add(producerId);
        
            try {
              const consumerInfo = await new Promise<any>((resolve) => {
                socket.emit("consume", {
                  rtpCapabilities: device.rtpCapabilities,
                  transportId: recvTransport.id,
                  producerId,
                }, resolve);
              });
        
              const consumer = await recvTransport.consume({
                id: consumerInfo.id,
                producerId,
                kind: consumerInfo.kind,
                rtpParameters: consumerInfo.rtpParameters,
              });
        
              consumers.push(consumer);
        
              setRemoteStreams((prev) => {
                const newStreams = { ...prev };
                if (!newStreams[socketId]) newStreams[socketId] = {};
        
                const stream = new MediaStream([consumer.track]);
                if (kind === "video") {
                  newStreams[socketId].video = stream;
                } else if (kind === "audio") {
                  newStreams[socketId].audio = stream;
                }
        
                return newStreams;
              });
        
              await consumer.resume();
            } catch (err) {
              console.error("Error consuming existing producer:", err);
            }
          }
        });
        

        setupTransport(sendTransport, "Send");
        setupTransport(recvTransport, "Receive");

        // Handle producer creation
        sendTransport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
          try {
            socket.emit("produce", {
              transportId: sendTransport.id,
              kind,
              rtpParameters
            }, ({ id }: { id: string }) => {
              callback({ id });
            });
          } catch (err: any) {
            errback(err);
            setConnectionStatus(`Produce Error: ${err.message}`);
          }
        });

        // Handle new producers from other clients
        socket.on("newProducer", async ({ producerId, socketId, kind }) => {
          if (addedProducers.has(producerId)) return;
          addedProducers.add(producerId);

          try {
            const consumerInfo = await new Promise<any>((resolve) => {
              socket.emit("consume", {
                rtpCapabilities: device.rtpCapabilities,
                transportId: recvTransport.id,
                producerId
              }, resolve);
            });

            const consumer = await recvTransport.consume({
              id: consumerInfo.id,
              producerId,
              kind: consumerInfo.kind,
              rtpParameters: consumerInfo.rtpParameters
            });

            consumers.push(consumer);

            setRemoteStreams(prev => {
              const newStreams = { ...prev };
              if (!newStreams[socketId]) {
                newStreams[socketId] = {};
              }
              
              if (kind === "video") {
                const stream = new MediaStream([consumer.track]);
                newStreams[socketId].video = stream;
              } else if (kind === "audio") {
                if (!newStreams[socketId].audio) {
                  const stream = new MediaStream([consumer.track]);
                  newStreams[socketId].audio = stream;
                } else {
                  newStreams[socketId].audio.addTrack(consumer.track);
                }
              }
              
              return newStreams;
            });

          } catch (err) {
            console.error("Consumer error:", err);
          }
        });

        // Handle producer disconnections
        socket.on("producerClosed", ({ socketId }) => {
          setRemoteStreams(prev => {
            const newStreams = { ...prev };
            delete newStreams[socketId];
            return newStreams;
          });
        });

        try {
          // Get user media and produce
          localStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true, 
            video: true 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = localStream;
          }
          setVideoStreamReady(true)
        } catch (error) {
          console.error(error);
          localStream = new MediaStream();
          setVideoStreamReady(false)
        }
        
        // Produce video
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          const videoProducer = await sendTransport.produce({ track: videoTrack });
          
          producers.push(videoProducer);
          setProducersState((prevData) => [...prevData, videoProducer]);
        }

        // Produce audio
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          const audioProducer = await sendTransport.produce({ track: audioTrack });
          console.log(audioProducer.paused, ' asdjasuidhasudh');
          
          setAudioPaused(audioProducer.paused)
          producers.push(audioProducer);
          setProducersState((prevData) => [...prevData, audioProducer]);
        }


        setConnectionStatus("Mediasoup Connected and Producing");
      } catch (err: any) {
        console.error("Mediasoup Init Error", err);
        setConnectionStatus(`Error: ${err.message}`);
      }
    };

    initializeMediasoup();

    return () => {
      socket.disconnect();
      localStream?.getTracks().forEach(track => track.stop());
      sendTransport?.close();
      recvTransport?.close();
      producers.forEach(p => p.close());
      consumers.forEach(c => c.close());
    };
  }, []);


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

  useEffect(() => {
    console.log(Object.keys(remoteStreams).length)
    
  }, [remoteStreams])

  const checkStreamsCss = () => {
    const streams = Object.keys(remoteStreams).length;
    if (streams > 45) return "grid-rows-6";
    if (streams >= 28) return "grid-rows-5";
    if (streams >= 15) return "grid-rows-4";
    if (streams >= 8) return "grid-rows-3";
    if (streams >= 3) return "grid-rows-2";
    return "grid-rows-1";
  };
  
  const toggleProducerAudio = () => {
    const audioProducer = producersState.find((item) => item.kind === "audio");
    console.log(audioProducer?.paused);
    
    if(!audioProducer) return;

    if(audioProducer.paused){
      audioProducer.resume();
      setAudioPaused(false)
    }else{
      audioProducer.pause();
      setAudioPaused(true)
    }
  }
  
  const toggleProducerVideo = () => {
    const videoProducer = producersState.find((item) => item.kind === "video");
    if(!videoProducer) return;
    console.log(videoProducer);
    if(videoProducer.paused){
      videoProducer.resume();
      setVideoStreamReady(true)
    }else{
      videoProducer.pause();
      setVideoStreamReady(false)
    }
  }

  return (
    <>
      <div className="bg-mob-primary min-h-screen h-full w-screen relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 h-[65px] rounded-md bg-mob-oBlack shadow-xl shadow-black p-4">
          <h2 className="text-white text-xl font-semibold">ShokuMesimit</h2>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm ${
              connectionStatus.includes("Error") ? "bg-red-500" : 
              connectionStatus.includes("Connected") ? "bg-green-500" : "bg-yellow-500"
            } text-white`}>
              {connectionStatus}
            </span>
            <button 
              onClick={toggleFullscreen}
              className="bg-mob-secondary cursor-pointer border border-black-200 shadow-xl shadow-black hover:opacity-50 text-white font-semibold px-4 py-2 rounded-md"
            >
              {isFullscreen ? "Largo ekranin e plote" : "Ekran i plote"}
            </button>
          </div>
        </div>

        {/* Video Grid */}
        <div className={` max-h-[calc(100vh-200px)] p-4 relative grid auto-cols-fr grid-flow-col ${checkStreamsCss()}  ${Object.keys(remoteStreams).length === 0 ? "absolute h-full w-full" : "gap-4"}`}>
          {/* Local video - larger when alone */}
          <div className={`bg-mob-oBlack border-black-200 border shadow-xl h-auto w-auto shadow-black rounded-xl ${Object.keys(remoteStreams).length === 0 ? "w-full h-full" : ""} ${Object.keys(remoteStreams).length > 1 ? "row-span-2": ""}`}> {/* ANOTHER CHECK: IF ANOTHER ONE IS CLICKED IT HAS TO REMOVE ROW SPAN HERE AND OTHER STREAM HAS ROW-SPAN2 */}
            <div className={`relative h-full flex-1 my-auto flex items-center ${Object.keys(remoteStreams).length === 0 ? "w-full" : ""}`}> {/* 16:9 aspect ratio */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  // muted
                  className={`${Object.keys(remoteStreams).length === 0 ? "w-full h-full object-contain" : "w-auto h-fit object-cover"}  rounded-xl ${videoStreamReady ? "" : "invisible"}`}
                />
                  {!videoStreamReady && <div className="absolute left-0 top-0 right-0 bottom-0 z-50 flex items-center justify-center">
                  <FaVideoSlash size={40} color="#fff"/>
                  </div>}
              <div className={`absolute bg-mob-oBlack bottom-3 left-3 bg-opacity-50 text-white px-4 py-1 rounded-md border border-black-200 shadow-xl shadow-black`}>
              <span className="text-white font-medium">Ju</span>
              </div>
            </div>
          </div>
          
          {/* Remote videos */}
          
          {Object.entries(remoteStreams).map(([socketId, streams]) => (
            <div 
              key={socketId} 
              className={`bg-mob-oBlack  w-auto h-auto border-black-200 border shadow-xl flex-1 shadow-black rounded-xl overflow-hidden`}> {/* if click make row-span-2 to show image clearly */}
              <div className="relative flex h-full items-center justify-center"> {/* 16:9 aspect ratio */}
                {streams.video && (
                  <RemoteVideo 
                    stream={streams.video}
                  />
                )}
                {!streams.video && (
                  <div className="absolute left-0 top-0 right-0 bottom-0 z-50 flex items-center justify-center">
                    <FaVideoSlash size={40} color="#fff"/>
                  </div>
                )}
                {streams.audio && (
                  <audio
                    autoPlay
                    muted
                    style={{position: "absolute"}}
                    playsInline
                    ref={(el) => {
                      if(el && streams.audio) {
                        el.srcObject = streams.audio
                      }
                    }}
                  />
                )}
                <div className="absolute bg-mob-oBlack bottom-3 left-3 mr-3 bg-opacity-50 text-white px-2 py-1 rounded-md border border-black-200 shadow-xl shadow-black">
                  <span className="text-white font-medium">Participant {socketId.slice(0, 4)}</span>
                </div>
              </div>
            </div>
          ))}
          
          

        </div>

        {/* Controls Bar */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center">
          <div className="bg-mob-oBlack rounded-full px-6 py-3 flex space-x-4 items-center shadow-[0_10px_40px_rgba(0,0,0)] border border-black-200">
            <button className={`${audioPaused ? "bg-gray-700 " : "bg-mob-secondary"}  hover:bg-gray-600 text-white p-3 rounded-full cursor-pointer`} onClick={toggleProducerAudio}>
              {audioPaused ? (
                <FaMicrophoneSlash size={20}/>
              ) : (
                <FaMicrophone size={20}/>
              )}
            </button>
            <button className={`${videoStreamReady ? "bg-mob-secondary" : "bg-gray-700"} hover:bg-gray-600 cursor-pointer text-white p-3 rounded-full`} onClick={toggleProducerVideo}>
              {videoStreamReady ? (
                <FaVideo size={20}/>
              ) : (
                <FaVideoSlash size={20}/>
              )}
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
              Share Screen
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="#fff">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
};

export default Layout;