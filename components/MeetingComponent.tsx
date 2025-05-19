"use client"
import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { FaCircleInfo, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa6';
import { LuScreenShare, LuScreenShareOff } from 'react-icons/lu';
import { useConnectionStatus } from '@/context/ConnectionContext';
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import RemoteVideo from "@/components/RemoteVideo";
import Image from "next/image";
import { useGlobalContext } from '@/context/GlobalProvider';
import LoadingComponent from './LoadingComponent';
import ControlMeetingComponent from './ControlMeetingComponent';
import { toast } from 'sonner';
import { participantJoined } from '@/lib/actions/actions';
import { AiOutlineAudio, AiOutlineAudioMuted } from "react-icons/ai";

interface UserData extends User {
  socketId: string;
}

interface RemoteStreamWithUser {
  video?: MediaStream
  audio?: MediaStream
  user?: UserData,
  videoPaused?: boolean,
  audioPaused?: boolean
}

const MeetingComponent = ({socket, meetingDetails}: {socket: Socket; meetingDetails: MeetingHeaderDetails}) => {
  if(socket === null) return <LoadingComponent />
  console.log(meetingDetails, " meetingdetails");
  
    
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStreamReady, setVideoStreamReady] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, RemoteStreamWithUser>>({})
  const [allUsers, setAllUsers] = useState<UserData[]>([])
  const {setConnectionStatus} = useConnectionStatus()

  const [audioPaused, setAudioPaused] = useState<boolean | undefined>(true)

  const [producersState, setProducersState] = useState<mediasoupClient.types.Producer[]>([])

  const [sendTransportState, setSendTransportState] = useState<mediasoupClient.types.Transport>()

  const deviceRef = useRef<mediasoupClient.types.Device>(null)

  const {user} = useGlobalContext()
  
  useEffect(() => {
    console.log(remoteStreams)
  }, [remoteStreams])
  
  // useEffect(() => {
  //   const handleMessage = async (event: MessageEvent) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       if(data?.type === "SET_TOKENS"){
  //         const {accessToken, refreshToken} = data;
  //         const response = await fetch(`${process.env.NEXT_PUBLIC_FORWARDED_URL}/api/native-tokens`, {
  //           method: "POST",
  //           headers: {'Content-Type': "application/json"},
  //           body: JSON.stringify({accessToken, refreshToken}),
  //           credentials: "include"
  //         })
  //         if(!response.ok){
  //             window.ReactNativeWebView?.postMessage(
  //               JSON.stringify({type: "ERROR", message: "Failed to set tokens"})
  //             )
  //         }else{
  //           window.ReactNativeWebView?.postMessage(
  //             JSON.stringify({type: "SUCCESS", message: "Tokens set successfully"})
  //           )
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Invalid message format:", error)
  //       window.ReactNativeWebView?.postMessage(
  //         JSON.stringify({ type: 'ERROR', message: 'Invalid message format' })
  //       );
  //     }
  //   }

  //   window.addEventListener('message', handleMessage);

  //   return () => window.removeEventListener('message', handleMessage);
  // }, [])
  

  useEffect(() => {
    let device: mediasoupClient.Device;
    let sendTransport: mediasoupClient.types.Transport;
    let recvTransport: mediasoupClient.types.Transport;
    let localStream: MediaStream;
    const producers: mediasoupClient.types.Producer[] = [];
    const consumers: mediasoupClient.types.Consumer[] = [];
    const addedProducers = new Set<string>();
    

    socket.on("producerPaused", ({producerId, kind, socketId}) => {
      setRemoteStreams(prev => {
        if(!prev[socketId]) return prev;

        return {
          ...prev,
          [socketId]: {
            ...prev[socketId],
            [`${kind}Paused`]: true
          }
        }
      })

    })

    socket.on("producerResumed", ({producerId, kind, socketId}) => {
      setRemoteStreams(prev => {
        if(!prev[socketId]) return prev;

        return {
          ...prev,
          [socketId]: {
            ...prev[socketId],
            [`${kind}Paused`]: false
          }
        }
      })
    })
    
    socket.on('user-connected', async ({ user, allUsers } : {user: UserData, allUsers: UserData[]}) => {
      console.log('New user connected:', user)
      setAllUsers(allUsers)
      console.log(allUsers);
      
      // Update remote streams with user data if already exists
      setRemoteStreams(prev => ({
        ...prev,
        [user.socketId]: {
          ...prev[user.socketId],
          user
        }
      }))

      toast(`${user.name} u fut ne dhome!`, {
        dismissible: true
      })

      const response = await participantJoined(meetingDetails.id)
      if(response){
        toast(`${user.name} u fut ne dhome!`, {
          dismissible: true
        })
      }else{
        toast.error(`Dicka shkoi gabim ne krijimin e progresit te ${user.name}`, {
          dismissible: true,
          description: "Ju lutem rifreskoni dritaren tuaj!"
        })
      }
    })

    socket.on('user-disconnected', ({ socketId }) => {
      setAllUsers(prev => prev.filter(u => u.socketId !== socketId))
      setRemoteStreams(prev => {
        const newStreams = { ...prev }
        delete newStreams[socketId]
        return newStreams
      })
    })

    const initializeMediasoup = async () => {
      try {
        setConnectionStatus(1);
        
        // Load device
        device = new mediasoupClient.Device();
        const rtpCapabilities = await new Promise<any>((resolve) => {
          socket.emit("getRouterRtpCapabilities", {}, resolve);
        });
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        setConnectionStatus(1);

        // Create transports
        const iceServers = [
          {
            urls: ['turn:158.101.170.230:3478'],
            username: 'erditi',
            credential: 'erditbaba'
          },
          {
            urls: ['stun:158.101.170.230:3478']
          },
          {
            urls: ['stun:stun.l.google.com:19302']
          },
          {
            urls: ['stun:stun1.l.google.com:19302']
          },
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
              setConnectionStatus(2);
            } catch (err: any) {
              errback(err);
              setConnectionStatus(0);
            }
          });

          transport.on("icecandidateerror", (event) => {
            console.log("ICE candidate error:", event);
          });
        };

        socket.emit("getProducers", async (producers: any[]) => {
          console.log(producers, ' producers');
          
          for (const { producerId, socketId, kind, user, paused } of producers) {
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
                  newStreams[socketId].user = user;
                  newStreams[socketId].videoPaused = paused;
                } else if (kind === "audio") {
                  newStreams[socketId].audio = stream;
                  newStreams[socketId].user = user;
                  newStreams[socketId].audioPaused = paused;
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
            setConnectionStatus(0);
          }
        });

        // Handle new producers from other clients
        socket.on("newProducer", async ({ producerId, socketId, kind, user }) => {
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
                newStreams[socketId] = {user};
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
          
          setAudioPaused(audioProducer.paused)
          producers.push(audioProducer);
          setProducersState((prevData) => [...prevData, audioProducer]);
        }


        setConnectionStatus(2);
      } catch (err: any) {
        console.error("Mediasoup Init Error", err);
        setConnectionStatus(0);
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

  //fix

  // const createSendTransport = async (socket: any, device: mediasoupClient.Device): Promise<mediasoupClient.types.Transport> => {
  //   const transportOptions = await new Promise<any>((resolve) => 
  //     socket.emit("createWebRtcTransport", { type: "send" }, resolve)
  //   );
  
  //   const transport = device.createSendTransport({
  //     ...transportOptions,
  //     iceServers: [
  //       {
  //         urls: ['turn:158.101.170.230:3478'],
  //         username: 'erditi',
  //         credential: 'erditbaba'
  //       },
  //       {
  //         urls: ['stun:158.101.170.230:3478']
  //       }
  //     ],
  //     iceTransportPolicy: "all"
  //   });
  
  //   transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
  //     try {
  //       await new Promise<void>((resolve, reject) => {
  //         socket.emit("connectTransport", {
  //           transportId: transport.id,
  //           dtlsParameters
  //         }, (response: any) => {
  //           response?.error ? reject(response.error) : resolve();
  //         });
  //       });
  //       callback();
  //     } catch (err) {
  //       errback(err as any);
  //     }
  //   });
  
  //   transport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
  //     try {
  //       socket.emit("produce", {
  //         transportId: transport.id,
  //         kind,
  //         rtpParameters
  //       }, ({ id }: { id: string }) => {
  //         callback({ id });
  //       });
  //     } catch (err) {
  //       errback(err as any);
  //     }
  //   });
  
  //   return transport;
  // };
  
  const [screenProducer, setScreenProducer] = useState<mediasoupClient.types.Producer | null>(null)
  const screenVideoRef = useRef<HTMLVideoElement>(null);


  //fix
  const toggleScreenShare = async () => {
    // try {
    //   if(!screenProducer){
    //     const stream = await navigator.mediaDevices.getDisplayMedia({video: true, audio: false})
    //     const track = stream.getVideoTracks()[0];
        
    //     if(!track) throw new Error("No screen video found");
    //     if(deviceRef.current === null || deviceRef.current === undefined) return;

    //     const screenSendTransport = await createSendTransport(socket, deviceRef.current)

    //     const producer = await screenSendTransport.produce({
    //       track,
    //       appData: {screen: true}
    //     })
  
    //     setScreenProducer(producer);
  
    //     if(screenVideoRef.current){
    //       screenVideoRef.current.srcObject = new MediaStream([track]);
    //     }
  
    //     track.onended = () => {
    //       producer.close();
    //       screenSendTransport.close();
    //       setScreenProducer(null);
    //       if(screenVideoRef.current){
    //         screenVideoRef.current.srcObject = null
    //       }
    //     }
    //   }
    // } catch (error) {
    //   console.error("Error starting screen share ", error);
    // }
  }

  const stopScreenShare = () => {
    if(screenProducer){
      screenProducer.close();
      setScreenProducer(null);
      if(screenVideoRef.current){
        screenVideoRef.current.srcObject = null;
      }
    }
  }

  const checkStreamsCss = () => {
    const streams = Object.keys(remoteStreams).length;
    if (streams > 45) return "grid-rows-6";
    if (streams >= 28) return "grid-rows-5";
    if (streams >= 15) return "grid-rows-4";
    if (streams >= 8) return "grid-rows-3";
    if (streams > 2) return "grid-rows-2";
    if (streams === 1) return "grid-rows-1 max-sm:grid-flow-row!"
    if(streams === 0) return ""
    // return "grid-rows-1";
  };
  
  const toggleProducerAudio = async () => {
    const audioProducer = producersState.find((item) => item.kind === "audio");
    
    if(!audioProducer) return;

    try {
      if(audioProducer.paused){
        await audioProducer.resume();
        socket.emit("resumeProducer", {
          producerId: audioProducer.id,
          kind: "audio"
        })
        setAudioPaused(false)
      }else{
        await audioProducer.pause();
        socket.emit("pauseProducer", {
          producerId: audioProducer.id,
          kind: "audio"
        })
        setAudioPaused(true)
      }
    } catch (error) {
      console.error("error toggling audio", error)
    }
  }
  
  const toggleProducerVideo = async () => {
    const videoProducer = producersState.find((item) => item.kind === "video");
    if(!videoProducer) return;
    
    try {
      if(videoProducer.paused){
        await videoProducer.resume();
        socket.emit("resumeProducer", {
          producerId: videoProducer.id,
          kind: "video"
        })
        setVideoStreamReady(true)
      }else{
        await videoProducer.pause();
        socket.emit("pauseProducer", {
          producerId: videoProducer.id,
          kind: "video"
        })
        setVideoStreamReady(false)
      }
    } catch (error) {
      console.error("Error toggling video:", error)
    }
    
  }

  return (
    <div className="bg-mob-primary h-screen !max-h-[calc(100vh-65px)] overflow-hidden w-full relative">
      {/* Video Grid */}
      <div className={`h-full max-h-[calc(100vh-165px)] w-full p-4 relative grid auto-cols-fr grid-flow-col ${checkStreamsCss()} ${Object.keys(remoteStreams).length === 0 ? 'absolute' : 'gap-4'}`}>
        {/* Local video */}
        <div className={`bg-mob-oBlack border-black-200 border shadow-xl h-full w-full shadow-black rounded-xl ${Object.keys(remoteStreams).length === 0 ? 'w-full h-full' : ''} ${Object.keys(remoteStreams).length > 1 ? 'row-span-2' : ''}`}>
          <div className={`relative h-full flex-1 my-auto flex items-center ${Object.keys(remoteStreams).length === 0 ? 'w-full' : ''}`}>
          {audioPaused && <div className="absolute top-2 right-2 sm:right-4 sm:top-4 z-50">
            <AiOutlineAudioMuted size={20} color='#FF9C01'/>
          </div>}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)"}}
              className={`${Object.keys(remoteStreams).length === 0 ? 'h-fit mx-auto object-contain' : 'h-full absolute top-0 right-0 left-0 mx-auto object-contain'} rounded-xl ${videoStreamReady ? '' : 'invisible'}`}
            />
            {!videoStreamReady && (
              <div className="min-h-[200px]">
                <div className="absolute h-full left-0 top-0 right-0 bottom-0 z-50 flex items-center justify-center">
                  {user?.profilePicture ? (
                    <Image
                      src={user.profilePicture}
                      alt={user.name}
                      width={200}
                      priority={true}
                      height={200}
                      className="rounded-full max-w-24 max-sm:max-w-16"
                    />
                  ) : (
                    <div className="bg-mob-secondary tooltip w-32 h-32 rounded-full flex items-center justify-center text-white text-sm lg:text-base">
                      <span>{user?.name}</span>
                      <span className="tooltip-text">{user?.name}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="absolute bg-mob-oBlack bottom-3 left-3 bg-opacity-50 text-white px-4 py-1 rounded-md border border-black-200 shadow-xl shadow-black">
              <div className="tooltip">
                <span className="text-white font-medium text-sm lg:text-base">Ju</span>
                <span className="tooltip-text">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Remote videos */}
        {Object.entries(remoteStreams).map(([socketId, streams]) => {

          const userRemote = streams.user || allUsers.find(u => u.socketId === socketId)
          const displayName = userRemote 
            ? `${userRemote.name}` 
            : `Participant ${socketId.slice(0, 4)}`
          console.log(userRemote);
          
            // console.log(streams.audio, ' aaudiot');
            // console.log(streams.video, ' videos')

          return (
            <div 
              key={socketId} 
              className="bg-mob-oBlack w-full h-full border-black-200 border shadow-xl shadow-black rounded-xl overflow-hidden"
            >
              <div className="relative h-full flex-1 my-auto flex items-center justify-center">
              {streams.audioPaused && <div className="absolute top-2 right-2 sm:right-4 sm:top-4 z-50">
                  <AiOutlineAudioMuted size={20} color='#FF9C01'/>
                </div>}
                {streams.video ? (
                  (!streams.videoPaused ? (
                    <>
                    <RemoteVideo stream={streams.video} />
                    <div className="absolute bg-mob-oBlack bottom-3 left-3 mr-3 bg-opacity-50 text-white px-2 py-1 items-center justify-center flex rounded-md border border-black-200 shadow-xl shadow-black">
                      <div className="tooltip">
                      <span className="text-white font-medium text-sm lg:text-base line-clamp-1">
                        {displayName}
                      </span>
                      <span className="tooltip-text">{displayName}</span>
                      </div>
                    </div>
                    </>
                  ) : (
                    <div className="h-full z-50 flex items-center justify-center">

                        <Image 
                          src={userRemote?.profilePicture || '/assets/images/logo.png'}
                          alt={displayName}
                          width={200}
                          height={200}
                          className="rounded-full max-w-24 max-sm:max-w-16"
                        />
                        <div className="absolute bg-mob-oBlack bottom-3 left-3 mr-3 bg-opacity-50 text-white px-2 py-1 items-center justify-center flex rounded-md border border-black-200 shadow-xl shadow-black">
                          <div className="tooltip">
                            <span className="text-white font-medium text-sm lg:text-base line-clamp-1">{displayName}</span>
                            <span className="tooltip-text">{displayName}</span>
                          </div>
                        </div>

                    </div>
                  ))
                ) : (
                  <div className="h-full z-50 flex items-center justify-center">
                        <Image 
                          src={userRemote?.profilePicture || '/assets/images/logo.png'}
                          alt={displayName}
                          width={200}
                          height={200}
                          className="rounded-full max-w-24 max-sm:max-w-16"
                        />
                        <div className="absolute bg-mob-oBlack bottom-3 left-3 mr-3 bg-opacity-50 text-white px-2 py-1 items-center justify-center flex rounded-md border border-black-200 shadow-xl shadow-black">
                          <div className="tooltip">
                            <span className="text-white font-medium text-sm lg:text-base line-clamp-1">{displayName}</span>
                            <span className="tooltip-text">{displayName}</span>
                          </div>
                        </div>

                    </div>
                )}
                
                
                {streams.audio && (
                  <audio
                    autoPlay
                    playsInline
                    ref={(el) => {
                      if (el && streams.audio) {
                        el.srcObject = streams.audio
                      }
                    }}
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Screen share overlay */}
      {screenProducer && (
        <div className="absolute m-auto flex-col z-50 left-0 right-0 bottom-0 top-0 w-[85%] h-[85%] bg-mob-oBlack border border-black-200 rounded-md p-4">
          <div className="flex-1 h-[calc(100%-40px)]">
            <video 
              ref={screenVideoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full border object-contain"
            />
          </div>
          <div className="">
            <button onClick={stopScreenShare} className="bg-mob-secondary cursor-pointer font-semibold w-full text-center m-auto items-center justify-center text-white flex flex-row rounded-b-sm px-4 py-2">
              Stop screen sharing
              <LuScreenShareOff size={24}/>
            </button>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      {/* <div className="fixed bottom-6 left-0 right-0 flex justify-center">
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
            {screenProducer ? 'Stop Sharing' : 'Share Screen'}
            <LuScreenShare size={20} className={`${screenProducer ? 'text-white group-hover:text-mob-secondary' : 'text-mob-secondary group-hover:text-white'}`}/>
          </button>
          
          <button className="bg-gray-700 cursor-pointer hover:bg-gray-600 text-white p-3 rounded-full">
            <FaCircleInfo size={20}/>
          </button>
        </div>
      </div> */}
      <ControlMeetingComponent meetingDetails={meetingDetails} audioPaused={audioPaused} videoStreamReady={videoStreamReady} screenProducer={screenProducer} toggleProducerAudio={toggleProducerAudio} toggleProducerVideo={toggleProducerVideo} stopScreenShare={stopScreenShare} toggleScreenShare={toggleScreenShare}/>
    </div>
  )
}

export default MeetingComponent