"use client"
import { useConnectionStatus } from '@/context/ConnectionContext'
import React from 'react'
import { usePathname } from 'next/navigation'

const ConnectionStatus = () => {
  const pathname = usePathname();
  if(!pathname.includes('/room')){
    return null;
  }
    const {connectionStatus} = useConnectionStatus()
  return (
    <div className={`p-3 animate-pulse rounded-full ${
        connectionStatus === 0 ? "bg-red-500" : 
        connectionStatus === 2 ? "bg-green-500" : "bg-yellow-500"
    } text-white`}>
    </div>
  )
}

export default ConnectionStatus