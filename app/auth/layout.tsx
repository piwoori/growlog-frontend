// app/auth/layout.tsx
"use client";

import type { ReactNode } from "react";
import Image from "next/image";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50">
            <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white px-8 py-10">
                {/* 🔥 여기서 예전 Growlog 텍스트 대신 로고 + 설명만 */}
                <div className="mb-6 flex flex-col items-center">
                    <Image
                        src="/growlog-logo.png"
                        alt="Growlog"
                        width={180}
                        height={50}
                        className="h-10 w-auto object-contain"
                        priority
                    />
                    <p className="mt-3 text-xs text-zinc-500">
                        나의 할 일·감정·회고를 한 곳에서 관리해요.
                    </p>
                </div>
                {children}
            </div>
        </div>
    );
}
