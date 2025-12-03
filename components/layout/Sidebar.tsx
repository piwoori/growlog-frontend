// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
    { href: "/dashboard", label: "오늘 요약" },
    { href: "/dashboard/todos", label: "할 일" },
    { href: "/dashboard/reflections", label: "회고" },
    { href: "/dashboard/emotions", label: "감정" },
    { href: "/dashboard/stats", label: "통계" },
];

function normalizePath(path: string | null): string {
    if (!path) return "";
    // 끝에 붙은 슬래시 제거 ("/dashboard/" -> "/dashboard")
    if (path.length > 1 && path.endsWith("/")) {
        return path.slice(0, -1);
    }
    return path;
}

export function Sidebar() {
    const rawPathname = usePathname();
    const pathname = normalizePath(rawPathname);

    return (
        <aside className="hidden h-screen w-56 border-r border-zinc-200 bg-white md:block">
            <div className="px-4 py-6">
                <h1 className="mb-6 text-lg font-semibold text-zinc-900">Growlog</h1>

                {/* 디버그용 – 잘 되면 이 <p>는 지워도 돼 */}
                <p className="mb-4 text-[10px] text-zinc-400 break-all">
                    현재 경로: {pathname}
                </p>

                <nav className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const href = normalizePath(item.href);
                        const isActive = pathname === href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center rounded-lg px-3 py-2 text-sm transition",
                                    isActive
                                        ? "bg-zinc-900 text-zinc-50"
                                        : "text-zinc-600 hover:bg-zinc-100"
                                )}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
}