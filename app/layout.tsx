import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Growlog",
    description: "감정 · 회고 · 할 일을 한 번에 관리하는 자기 관리 서비스",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <div className="min-h-screen bg-zinc-50">
            {/* 상단 네비게이션 */}
            <header className="border-b border-zinc-200 bg-white">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
                    {/* 로고 / 홈 링크 */}
                    <Link href="/dashboard" className="text-sm font-semibold">
                        Growlog
                    </Link>

                    {/* 우측 네비게이션 */}
                    <nav className="flex items-center gap-4 text-xs text-zinc-600">
                        <Link href="/dashboard" className="hover:text-zinc-900">
                            대시보드
                        </Link>
                        <Link href="/settings" className="hover:text-zinc-900">
                            설정
                        </Link>
                    </nav>
                </div>
            </header>

            {/* 메인 컨텐츠 영역 */}
            <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        </div>
        </body>
        </html>
    );
}
