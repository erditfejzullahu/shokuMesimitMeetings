"use client"
import React, { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client';
import MeetingComponent from './MeetingComponent';
import { getAccessToken } from '@/lib/auth/auth';
import LoadingComponent from './LoadingComponent';
import { JWTPayload } from 'jose';
import { logout } from '@/lib/actions/logout';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { addNewStudent } from '@/lib/actions/actions';

const SocketConnection = ({ roomUrl, session, meetingDetails }: { roomUrl: string, session: Session, meetingDetails: MeetingHeaderDetails }) => {
    const router = useRouter();
    const socketRef = useRef<Socket | null>(null); // Ref to keep socket instance across renders
    const [isConnected, setIsConnected] = useState(false); // State for connection status
    const token = session.user.token
    useEffect(() => {
        // Check if socket already exists to avoid recreation
        if (!socketRef.current) {
            // Create a new socket connection if not already created
            socketRef.current = io("https://onlinemeet.hajt24.xyz", {
                query: { roomUrl },
                auth: { token },
            });
        }

        const newSocket = socketRef.current;

        // Add event listeners for connection status
        newSocket.on("connect", () => {
            console.log("✅ Socket connected!");
            console.log("Socket ID:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on("connect_error", async (err) => {
            console.error("❌ Connection error:", err.message);
            if(err.message === "Error: Token has expired. Please login!"){
                await logout();
                router.replace('/login')
            }else if(err.message === "Unauthorized: Not authenticated"){
                await logout();
                router.replace('/login')
            }else if(err.message === "Error: Something went wrong"){
                toast("Dicka shkoi gabim", {
                    description: "Ju lutem provoni perseri veprimin e njejte!",
                    dismissible: true
                })
            }else if(err.message === "Not allowed"){
                toast("Nuk jeni te lejuar te kyceni ne dhome", {
                    description: "Per tu bere student i instruktorit klikoni butonin e ngjitur!",
                    action: {
                        label: "Behuni Student",
                        onClick: async () => {
                            const response = await addNewStudent(meetingDetails, parseInt(session.user.id))
                            if(response === 1){
                                toast.success("Sukses!", {
                                    description: "Sapo u bete student te instruktorit! Tani mund te ndiqni ligjeratat online."
                                })
                                setTimeout(() => {
                                    router.refresh();
                                }, 500);
                            }else{
                                toast.error("Dicka shkoi gabim", {
                                    description: "Ju lutem provoni perseri, apo kontaktoni Panelin e Ndihmes!",
                                })
                            }
                        } 
                    }
                })
            }

            setIsConnected(false); // Set false on error
        });

        newSocket.on("disconnect", (reason) => {
            console.log("⚠️ Disconnected:", reason);
            if (reason === "io server disconnect") {
                console.log("Server forcibly disconnected");
            }
            setIsConnected(false); // Mark as disconnected
        });

        // Cleanup on component unmount or when roomUrl/token changes
        return () => {
            if (newSocket.connected) {
                newSocket.disconnect();
            }
        };
    }, [roomUrl]); // Dependencies only include roomUrl and token

    // Show Loading until connected


    return <MeetingComponent socket={socketRef.current!} />;
};

export default SocketConnection;
