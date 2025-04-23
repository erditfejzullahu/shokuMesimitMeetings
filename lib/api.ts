import { getAccessToken, getRefreshToken, storeTokens, clearTokens, isTokenExpired  } from "./auth/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    let accessToken = getAccessToken();
    let refreshToken = getRefreshToken();
    
    if(!accessToken || !refreshToken){
        return fetch(`${API_BASE_URL}${endpoint}`, options);
    }

    const isTokenExpiredOrInvalid = isTokenExpired(accessToken);

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
                storeTokens(tokens.data.accessToken, tokens.data.refreshToken);
                accessToken = tokens.data.accessToken;
            }else{
                clearTokens();
                window.location.href = '/login';
                throw new Error("Session expired. Login again");
            }
        } catch (error) {
            clearTokens();
            window.location.href = "/login"
            throw error;
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