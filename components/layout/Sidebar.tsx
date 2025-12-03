// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
    { href: "/dashboard", label: "대시보드" },
    { href: "/todos", label: "할 일" },
    { href: "/emotions", label: "감정 기록" },
    { href: "/reflections", label: "회고" },
    { href: "/stats", label: "통계" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden h-screen w-56 border-r border-zinc-200 bg-white md:block">
            <div className="px-4 py-6">
                <h1 className="mb-6 text-lg font-semibold text-zinc-900">Growlog</h1>

                <nav className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center rounded-lg px-3 py-2 text-sm",
                                    active
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
