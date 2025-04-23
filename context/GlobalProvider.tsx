"use client"
import { fetchUserData } from "@/lib/necessaryDetails";
import {createContext, useContext, useState, useEffect, ReactNode} from "react"

interface GlobalContextType {
    isLoggedIn: boolean;
    setIsLoggedIn: (value: boolean) => void;
    user: User | null;
    setUser: (value: User | null) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
}

const GlobalContext = createContext<GlobalContextType>({
    isLoggedIn: false,
    setIsLoggedIn: (value: boolean) => {},
    user: null,
    setUser: (value: User | null) => {},
    isLoading: false,
    setIsLoading: (value: boolean) => {}
});

export const useGlobalContext = () => useContext(GlobalContext)

const GlobalProvider = ({children}: {children: ReactNode}) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    useEffect(() => {
      const fetchUserDetails = async () => {
        setIsLoading(true)
        try {
            const response = await fetchUserData()
            console.log(response, ' tek globalcontext');
            
            if(response){
                setIsLoggedIn(true)
                setUser(response)
            }else{
                setIsLoggedIn(false)
                setUser(null)
            }
        } catch (error) {
            setIsLoggedIn(false)
        } finally {
            setIsLoading(false)
        }
      }
      fetchUserDetails();
    }, [])
    return (
        <GlobalContext.Provider value={{isLoggedIn, setIsLoggedIn, user, setUser, isLoading, setIsLoading}}>
            {children}
        </GlobalContext.Provider>
    )
}

export default GlobalProvider;