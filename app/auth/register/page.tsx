"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        // TODO: 여기서 백엔드 POST /auth/register 붙일 예정
        console.log("register try:", { nickname, email, password });
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="mb-6 text-2xl font-semibold text-zinc-900">회원가입</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-800">닉네임</label>
                        <input
                            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            required
                            placeholder="피우리"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-800">이메일</label>
                        <input
                            type="email"
                            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-zinc-800">비밀번호</label>
                        <input
                            type="password"
                            className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="8자 이상"
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-2 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-zinc-50 hover:bg-zinc-800"
                    >
                        가입하기
                    </button>
                </form>

                <p className="mt-4 text-center text-xs text-zinc-500">
                    이미 계정이 있나요?{" "}
                    <Link href="/auth/login" className="font-medium text-indigo-600">
                        로그인 하기
                    </Link>
                </p>
            </div>
        </main>
    );
}
