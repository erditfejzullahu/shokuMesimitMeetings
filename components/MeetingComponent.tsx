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
import { getAccessToken } from '@/lib/auth/auth';
import { useGlobalContext } from '@/context/GlobalProvider';
import LoadingComponent from './LoadingComponent';

interface UserData extends User {
  socketId: string;
}

interface RemoteStreamWithUser {
  video?: MediaStream
  audio?: MediaStream
  user?: UserData
}

const MeetingComponent = ({socket}: {socket: Socket}) => {
  if(socket === null) return <LoadingComponent />
    
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
  
  useEffect(() => {
    let device: mediasoupClient.Device;
    let sendTransport: mediasoupClient.types.Transport;
    let recvTransport: mediasoupClient.types.Transport;
    let localStream: MediaStream;
    const producers: mediasoupClient.types.Producer[] = [];
    const consumers: mediasoupClient.types.Consumer[] = [];
    const addedProducers = new Set<string>();
    
    
    socket.on('user-connected', ({ user, allUsers }) => {
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
          console.log("u thirrz")
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
          
          for (const { producerId, socketId, kind, user } of producers) {
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
                } else if (kind === "audio") {
                  newStreams[socketId].audio = stream;
                  newStreams[socketId].user = user;
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
          console.log(audioProducer.paused, ' asdjasuidhasudh');
          
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


  

  useEffect(() => {
    console.log(Object.keys(remoteStreams).length)
    
  }, [remoteStreams])

  const checkStreamsCss = () => {
    const streams = Object.keys(remoteStreams).length;
    if (streams > 45) return "grid-rows-6";
    if (streams >= 28) return "grid-rows-5";
    if (streams >= 15) return "grid-rows-4";
    if (streams >= 8) return "grid-rows-3";
    if (streams > 2) return "grid-rows-2";
    if (streams === 1) return "grid rows-1"
    if(streams === 0) return ""
    // return "grid-rows-1";
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
    <div className="bg-mob-primary min-h-screen h-full w-screen relative">
      {/* Video Grid */}
      <div className={`max-h-[calc(100vh-200px)] p-4 relative grid auto-cols-fr grid-flow-col ${checkStreamsCss()} !grid-rows-2 ${Object.keys(remoteStreams).length === 0 ? 'absolute h-full w-full' : 'gap-4'}`}>
        {/* Local video */}
        <div className={`bg-mob-oBlack border-black-200 border shadow-xl h-auto w-auto shadow-black rounded-xl ${Object.keys(remoteStreams).length === 0 ? 'w-full h-full' : ''} ${Object.keys(remoteStreams).length > 1 ? 'row-span-2' : ''}`}>
          <div className={`relative h-full flex-1 my-auto flex items-center ${Object.keys(remoteStreams).length === 0 ? 'w-full' : ''}`}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`${Object.keys(remoteStreams).length === 0 ? 'w-full h-full object-contain' : 'h-full absolute top-0 right-0 left-0 mx-auto object-contain'} rounded-xl ${videoStreamReady ? '' : 'invisible'}`}
            />
            {!videoStreamReady && (
              <div className="absolute left-0 top-0 right-0 bottom-0 z-50 flex items-center justify-center">
                {user?.profilePic ? (
                  <Image
                    src={user.profilePic}
                    alt="Your avatar"
                    width={200}
                    height={200}
                    className="rounded-full"
                  />
                ) : (
                  <div className="bg-mob-secondary w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl">
                    {user?.name}
                  </div>
                )}
              </div>
            )}
            <div className="absolute bg-mob-oBlack bottom-3 left-3 bg-opacity-50 text-white px-4 py-1 rounded-md border border-black-200 shadow-xl shadow-black">
              <span className="text-white font-medium">You</span>
              {audioPaused && ' (Muted)'}
            </div>
          </div>
        </div>
        
        {/* Remote videos */}
        {Object.entries(remoteStreams).map(([socketId, streams]) => {
          const users = allUsers.find((test) => test.socketId === socketId);
          console.log(allUsers,  ' ? ? ?? ?ASD? ');
          console.log(streams, ' streams')
          const userRemote = streams.user || allUsers.find(u => u.socketId === socketId)
          const displayName = userRemote 
            ? `${userRemote.name}` 
            : `Participant ${socketId.slice(0, 4)}`

          return (
            <div 
              key={socketId} 
              className="bg-mob-oBlack w-auto h-auto border-black-200 border shadow-xl flex-1 shadow-black rounded-xl overflow-hidden"
            >
              <div className="relative h-full flex-1 my-auto flex items-center justify-center">
                {streams.video ? (
                  <RemoteVideo stream={streams.video} />
                ) : (
                  <div className="absolute left-0 top-0 right-0 bottom-0 z-50 flex items-center justify-center">
                    {userRemote?.profilePic ? (
                      <Image 
                        src={userRemote.profilePic}
                        alt={displayName}
                        width={200}
                        height={200}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="bg-mob-secondary w-32 h-32 rounded-full flex items-center justify-center text-white text-4xl">
                        {userRemote?.name}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="absolute bg-mob-oBlack bottom-3 left-3 mr-3 bg-opacity-50 text-white px-2 py-1 rounded-md border border-black-200 shadow-xl shadow-black">
                  <span className="text-white font-medium">
                    {displayName}
                    {streams.audio === undefined && ' (Muted)'}
                  </span>
                </div>
                
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
      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
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
      </div>
    </div>
  )
}

export default MeetingComponent