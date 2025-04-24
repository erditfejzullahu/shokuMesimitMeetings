import { redirect } from "next/navigation";
import { getAccessToken, getRefreshToken, setAuthCookies, isTokenExpired, clearAuthCookies  } from "./auth/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    let accessToken = await getAccessToken();
    let refreshToken = await getRefreshToken();
    
    if(!accessToken || !refreshToken){
        return fetch(`${API_BASE_URL}${endpoint}`, options);
    }

    const isTokenExpiredOrInvalid = await isTokenExpired(accessToken);

    if(isTokenExpiredOrInvalid.expired){
        try {
            const refreshResponse = await fetch(`${API_BASE_URL}/api/Users/refresh`, {
                method: "POST",
                headers: {
                    "ngrok-skip-browser-warning": "69420",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({token: refreshToken})
            });

            if(refreshResponse.ok){
                const tokens = await refreshResponse.json();
                setAuthCookies({accessToken: tokens.data.accessToken, refreshToken: tokens.data.refreshToken})
                accessToken = tokens.data.accessToken;
            }else{
                await clearAuthCookies()
                redirect('/login')
            }
        } catch (error) {
            await clearAuthCookies()
            redirect('/login')
        }
    }

    const headers = new Headers(options.headers || {})
    headers.set("ngrok-skip-browser-warning", "69420")
    headers.set("Authorization", `Bearer ${accessToken}`)

    return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });
};