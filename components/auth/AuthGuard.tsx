"use client";

import { useAuth } from "@/hooks/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth(true); // 로그인 없으면 로그인 페이지로

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-zinc-500 text-sm">
                로그인 정보를 확인 중입니다...
            </div>
        );
    }

    if (!user) return null; // redirect 됨

    return <>{children}</>;
}