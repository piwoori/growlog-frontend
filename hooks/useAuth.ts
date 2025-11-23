"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export interface AuthUser {
    id: number;
    email: string;
    nickname: string | null;
    role: string;
}

export function useAuth(redirectToLogin = false) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let ignore = false;

        const fetchMe = async () => {
            try {
                const res = await api.get("/auth/me");
                if (ignore) return;

                setUser(res.data); // /auth/me 응답 = user 객체 그대로
            } catch (err) {
                if (ignore) return;

                setUser(null);

                if (redirectToLogin) {
                    router.replace("/auth/login");
                }
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        fetchMe();
        return () => {
            ignore = true;
        };
    }, [redirectToLogin, router]);

    return { user, loading };
}