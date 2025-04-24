"use server"
import { cookies } from "next/headers";
import { decodeJwt } from "jose";

export async function getSession() {
    const token = (await cookies()).get('ACCESS_TOKEN')?.value;

    if(!token) return null;

    try {
        const payload = decodeJwt(token);
        return {
            user: {
                id: payload.sub,
                name: payload.Name,
                username: payload.Username,
                role: payload.Role,
                email: payload.Email,
                profilePicture: payload.ProfilePicture
            },
            expires: new Date(payload.exp! * 1000)
        }
    } catch (error) {
        return null;
    }
}