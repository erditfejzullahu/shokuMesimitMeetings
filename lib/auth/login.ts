"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { loginSchema, type LoginFormData } from "../schemas/login-shcema"
import { setAuthCookies } from "./auth"

export type LoginState = {
    errors?: {
        username?: string[];
        password?: string[];
    };
    message?: string | null
}

export const loginAction = async (prevState: LoginState, formData: FormData): Promise<LoginState> => {
    const validatedFields = loginSchema.safeParse({
        username: formData.get("username"),
        password: formData.get("password")
    })

    if(!validatedFields.success){
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Fusha te pambushura apo invalide"
        }
    }

    const {username, password} = validatedFields.data;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({username, password})
        })
        const data = await res.json();
        if(data.message === "Login incorrect!") return {message: "Te dhenat tuaja jane gabim!"}
        const {accessToken, refreshToken} = data.token;

        await setAuthCookies(data.token)
        // (await cookies()).set('session', accessToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "lax",
        //     maxAge: 6 * 60 * 60,
        //     path: '/',
        // });

        // (await cookies()).set('refresh', refreshToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: 'lax',
        //     maxAge: 60 * 60 * 24 * 7
        // })

        redirect('/room')

    } catch (error) {
        console.error('login error', error);
        return {message: "Dicka shkoi gabim."}
    }
}
