import {decodeJwt, jwtVerify} from "jose";
import { importJWK } from 'jose';

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
        console.log(data)
        if(res.ok){
            const {accessToken, refreshToken} = data.token;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        }
        return data;
    } catch (error) {
        console.error(error);
        return false;
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

export const isTokenExpired = (token: string): {expired: boolean} => {
    try {
        const payload = decodeJwt(token);
        return {expired: payload.exp ? payload.exp * 1000 < Date.now() : true}
    } catch (error) {
        console.error(error, ' Error token decode');
        return {expired: true};
    }
}