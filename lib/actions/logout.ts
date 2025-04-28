"use server"

import { clearAuthCookies } from "../auth/auth"

export const logout = async () => {
    await clearAuthCookies();
}