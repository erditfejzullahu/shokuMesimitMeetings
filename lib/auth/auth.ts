import {jwtVerify} from "jose";

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const login = async (username: string, password: string) => {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        })
        const data = await res.json();
        if(res.ok){
            const {accessToken, refreshToken} = data.token;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        }
        
    } catch (error) {
        console.error(error);
    }
}

export const storeTokens = (accessToken: string, refreshToken: string) => {
    if(typeof window !== "undefined") {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
}

export const getAccessToken = (): string | null => {
    if(typeof window !== "undefined"){
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }
    return null;
}

export const getRefreshToken = (): string | null => {
    if(typeof window !== "undefined"){
        return localStorage.getItem(REFRESH_TOKEN_KEY)
    }
    return null;
}

export const clearTokens = () => {
    if(typeof window !== "undefined"){
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
    }
}

export const isTokenExpired = async (token: string): Promise<{valid: boolean; expired: boolean}> => {
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const {payload} = await jwtVerify(token, secret);
        return {valid: true, expired: payload.exp ? payload.exp * 1000 < Date.now() : true}
    } catch (error) {
        return {valid: false, expired: true};
    }
}