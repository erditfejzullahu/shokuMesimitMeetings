"use client"

import {createContext, ReactNode, useContext, useState} from "react"

type ConnectionStatus = 0 | 1 | 2; //0: error 1:connecting 2:connected

const ConnectionContext = createContext({
    connectionStatus: 0,
    setConnectionStatus: (status: ConnectionStatus) => {}
})

export function ConnectionProvider({children}: {children: ReactNode}) {
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(0)

    return (
        <ConnectionContext.Provider value={{ connectionStatus, setConnectionStatus }}>
            {children}
        </ConnectionContext.Provider>
    )
}

export function useConnectionStatus() {
    return useContext(ConnectionContext);
}