// lib/auth.ts
import { api } from "./api";

export interface AuthUser {
    id: number;
    email: string;
    nickname: string;
    role: "USER" | "ADMIN" | string;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
    try {
        const res = await api.get<AuthUser>("/auth/me");
        return res.data;
    } catch (err: any) {
        // 토큰 없거나 만료 → 401
        if (err.response?.status === 401) {
            return null;
        }
        console.error("failed to fetch /auth/me", err);
        throw err;
    }
}