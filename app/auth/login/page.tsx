// app/auth/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // 프론트 단 기본 검증 문구 통일
        if (!email.trim()) {
            setError("이메일을 입력해 주세요.");
            return;
        }
        if (!password.trim()) {
            setError("비밀번호를 입력해 주세요.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });

            const token = res.data?.token; // Swagger에서 token으로 명시됨
            if (!token) {
                setError("로그인에 실패했어요. 잠시 후 다시 시도해 주세요.");
                return;
            }

            localStorage.setItem("accessToken", token);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("로그인 에러:", err.response?.status, err.response?.data);
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "이메일 또는 비밀번호를 다시 확인해 주세요."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900">로그인</h2>
            <p className="mb-4 text-xs text-zinc-500">
                Growlog 계정으로 로그인해 할 일·감정·회고를 관리해 보세요.
            </p>

            {error && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-800">이메일</label>
                    <input
                        type="email"
                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="example@growlog.me"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-800">비밀번호</label>
                    <input
                        type="password"
                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="8자 이상 입력해 주세요."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-zinc-50 hover:bg-zinc-800 disabled:opacity-60 disabled:hover:bg-zinc-900"
                >
                    {isLoading ? "로그인 중..." : "로그인"}
                </button>
            </form>

            <p className="mt-4 text-center text-xs text-zinc-500">
                아직 계정이 없나요?{" "}
                <Link
                    href="/auth/register"
                    className="font-medium text-zinc-900 underline"
                >
                    회원가입 하기
                </Link>
            </p>
        </>
    );
}