"use server"
import { cookies } from "next/headers";
import { decodeJwt, JWTPayload } from "jose";

export async function getSession() {
    const token = (await cookies()).get('accessToken')?.value;

    if(!token) return null;

    try {
        const payload = decodeJwt(token) as CustomJwtClaims;
        return {
            user: {
                id: payload.sub,
                name: payload.Name,
                username: payload.Username,
                role: payload.Role,
                email: payload.Email,
                profilePicture: payload.ProfilePicture,
                token: token
            },
            expires: new Date(payload.exp! * 1000)
        }
    } catch (error) {
        return null;
    }
}