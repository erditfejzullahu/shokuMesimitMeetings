"use client"
import React, { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client';
import MeetingComponent from './MeetingComponent';
import { getAccessToken } from '@/lib/auth/auth';
import LoadingComponent from './LoadingComponent';

const SocketConnection = ({ roomUrl }: { roomUrl: string }) => {
    const socketRef = useRef<Socket | null>(null); // Ref to keep socket instance across renders
    const [isConnected, setIsConnected] = useState(false); // State for connection status
    const token = getAccessToken();

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

        newSocket.on("connect_error", (err) => {
            console.error("❌ Connection error:", err.message);
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
