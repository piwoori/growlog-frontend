"use client";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardHeader() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="mb-6">
            <p className="text-sm text-zinc-500">오늘도 성장 중이에요 👋</p>
            <h2 className="text-xl font-semibold text-zinc-900">
                {user.nickname || user.email}님
            </h2>
        </div>
    );
}