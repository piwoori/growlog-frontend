// app/auth/register/page.tsx
"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function RegisterPage() {
    const router = useRouter();

    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // 프론트 단 기본 검증 문구 통일
        if (!nickname.trim()) {
            setError("닉네임을 입력해 주세요.");
            return;
        }
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
            await api.post("/auth/signup", {
                nickname: nickname.trim(),
                email: email.trim(),
                password,
            });

            router.push("/auth/login");
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "회원가입에 실패했어요. 잠시 후 다시 시도해 주세요."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <h2 className="mb-1 text-lg font-semibold text-zinc-900">회원가입</h2>
            <p className="mb-4 text-xs text-zinc-500">
                Growlog 계정을 만들고 할 일·감정·회고를 한 곳에서 관리해 보세요.
            </p>

            {error && (
                <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-800">닉네임</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        placeholder="예: 피우리"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-800">이메일</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        placeholder="example@growlog.me"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-800">비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                        placeholder="8자 이상 입력해 주세요."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full rounded-full bg-[#F3F4F6] py-2.5 text-sm font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-60"
                >
                    {isLoading ? "가입 중..." : "가입하기"}
                </button>
            </form>

            <p className="mt-4 text-center text-xs text-zinc-500">
                이미 계정이 있나요?{" "}
                <Link href="/auth/login" className="font-medium text-zinc-900 underline">
                    로그인 하기
                </Link>
            </p>
        </>
    );
}