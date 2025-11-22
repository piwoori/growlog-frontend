import Link from "next/link";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-zinc-50">
            <aside className="w-60 border-r border-zinc-200 bg-white px-4 py-6">
                <h1 className="mb-8 text-xl font-semibold text-zinc-900">Growlog</h1>
                <nav className="flex flex-col gap-2 text-sm">
                    <Link href="/dashboard" className="rounded-md px-3 py-2 hover:bg-zinc-100">오늘 요약</Link>
                    <Link href="/dashboard/todos" className="rounded-md px-3 py-2 hover:bg-zinc-100">할 일</Link>
                    <Link href="/dashboard/reflections" className="rounded-md px-3 py-2 hover:bg-zinc-100">회고</Link>
                    <Link href="/dashboard/emotions" className="rounded-md px-3 py-2 hover:bg-zinc-100">감정</Link>
                    <Link href="/dashboard/stats" className="rounded-md px-3 py-2 hover:bg-zinc-100">통계</Link>
                </nav>
            </aside>
            <main className="flex-1 px-8 py-6">{children}</main>
        </div>
    );
}
