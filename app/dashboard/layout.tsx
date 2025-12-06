"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import clsx from "clsx";
import { fetchCurrentUser, type AuthUser } from "@/lib/auth";

const NAV_ITEMS = [
    { href: "/dashboard", label: "오늘 요약" },
    { href: "/dashboard/todos", label: "할 일" },
    { href: "/dashboard/reflections", label: "회고" },
    { href: "/dashboard/emotions", label: "감정" },
    { href: "/dashboard/stats", label: "통계" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("accessToken")
                : null;

        if (!token) {
            router.replace("/auth/login");
            return;
        }

        fetchCurrentUser()
            .then((me) => {
                if (!me) {
                    router.replace("/auth/login");
                    return;
                }
                setUser(me);
            })
            .catch((err) => {
                console.error("failed to load current user", err);
                router.replace("/auth/login");
            })
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-50">
                <p className="text-sm text-zinc-500">로그인 상태 확인 중...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-zinc-50">
            {/* 사이드바 */}
            <aside className="w-60 border-r border-zinc-200 bg-white px-4 py-6">
                <h1 className="mb-8 text-xl font-semibold text-zinc-900">Growlog</h1>
                <nav className="flex flex-col gap-2 text-sm">
                    {NAV_ITEMS.map((item) => {
                        const isRoot = item.href === "/dashboard";

                        // ✅ 루트(/dashboard)는 완전 일치일 때만 활성
                        // ✅ 나머지는 하위 경로까지 허용
                        const isActive = isRoot
                            ? pathname === item.href
                            : pathname === item.href || pathname.startsWith(item.href + "/");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "rounded-md px-3 py-2 transition",
                                    isActive
                                        ? "bg-[#F3F4F6] text-zinc-900" // ✅ 활성 색상 변경
                                        : "text-zinc-600 hover:bg-zinc-100"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* 메인 영역 */}
            <main className="flex-1 px-8 py-6">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-zinc-500">오늘도 성장하는 중 🌱</p>
                        {user && (
                            <p className="text-lg font-semibold text-zinc-900">
                                {(user.nickname || user.email) + "님, 환영합니다."}
                            </p>
                        )}
                    </div>
                    <button
                        className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                localStorage.removeItem("accessToken");
                            }
                            router.replace("/auth/login");
                        }}
                    >
                        로그아웃
                    </button>
                </header>

                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}