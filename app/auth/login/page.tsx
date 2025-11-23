"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });

            // 백엔드 Swagger에 token 으로 명시되어 있었음
            const token = res.data?.token;

            if (!token) {
                alert("로그인 응답에 토큰이 없습니다.");
                return;
            }

            // 토큰 저장
            localStorage.setItem("accessToken", token);

            alert("로그인 성공!");
            // 대시보드로 이동
            window.location.href = "/dashboard";
        } catch (err: any) {
            console.log("로그인 에러:", err.response?.status, err.response?.data);
            alert(err.response?.data?.message || "로그인 실패");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                <h1 className="mb-6 text-2xl font-semibold text-zinc-900">로그인</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        로그인
                    </button>
                </form>

                <p className="mt-4 text-center text-xs text-zinc-500">
                    아직 계정이 없나요?{" "}
                    <Link href="/auth/register" className="font-medium text-indigo-600">
                        회원가입 하기
                    </Link>
                </p>
            </div>
        </main>
    );
}
