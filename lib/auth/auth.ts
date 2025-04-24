"use server"
import {decodeJwt} from "jose";
import { cookies } from "next/headers";

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';



export const setAuthCookies = async (tokens: {
    accessToken: string;
    refreshToken: string;
    csrfToken?: string
}) => {
    console.log(tokens, ' tokenss');
    
    (await cookies()).set(ACCESS_TOKEN_KEY, tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: '/',
        maxAge: 60 * 15
    });

    (await cookies()).set(REFRESH_TOKEN_KEY, tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
}

export const clearAuthCookies = async () => {
    (await cookies()).delete(ACCESS_TOKEN_KEY);
    (await cookies()).delete(REFRESH_TOKEN_KEY);
}

export const getAccessToken = async () => {
    return (await cookies()).get(ACCESS_TOKEN_KEY)?.value;
}

export const getRefreshToken = async () => {
    return (await cookies()).get(REFRESH_TOKEN_KEY)?.value;
}

export const isTokenExpired = async (token: string): Promise<{expired: boolean}> => {
    try {
        const payload = decodeJwt(token);
        return {expired: payload.exp ? payload.exp * 1000 < Date.now() : true}
    } catch (error) {
        console.error(error, ' Error token decode');
        return {expired: true};
    }
}