"use client";
import React, { ReactNode, useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import * as mediasoupClient from "mediasoup-client";
import RemoteVideo from "@/components/RemoteVideo";

const Layout = ({ children }: { children: ReactNode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, {video?: MediaStream, audio?: MediaStream}>>({});
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");

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

        // Get user media and produce
        localStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: true 
        });

        if (videoRef.current) {
          videoRef.current.srcObject = localStream;
        }

        // Produce video
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          const videoProducer = await sendTransport.produce({ track: videoTrack });
          producers.push(videoProducer);
        }

        // Produce audio
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          const audioProducer = await sendTransport.produce({ track: audioTrack });
          producers.push(audioProducer);
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

  return (
    <>
      <div className="bg-gray-500 p-4">
        <h2 className="text-white text-lg font-bold">Video Conference</h2>
        <div className="flex flex-wrap gap-4">
          {/* Local video */}
          <div className="w-64">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg border-2 border-white"
            />
            <p className="text-white text-center">You</p>
          </div>
          
          {/* Remote videos */}
          {Object.entries(remoteStreams).map(([socketId, streams]) => (
            <div key={socketId} className="w-64">
              {streams.video && (
                <RemoteVideo stream={streams.video} />
              )}
              {streams.audio && (
                <audio
                  autoPlay
                  playsInline
                  ref={(el) => el && (el.srcObject = streams.audio)}
                />
              )}
              <p className="text-white text-center">Participant {socketId.slice(0, 4)}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <h3 className="text-white">Status: {connectionStatus}</h3>
        </div>
      </div>
      {children}
    </>
  );
};

export default Layout;