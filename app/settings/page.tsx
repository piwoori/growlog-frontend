"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/layout/PageTitle";

interface MeResponse {
    id: number;
    email: string;
    nickname: string;
    role: string;
}

export default function SettingsPage() {
    const [me, setMe] = useState<MeResponse | null>(null);
    const [loading, setLoading] = useState(true);

    const [nickname, setNickname] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);

    const [deleting, setDeleting] = useState(false);

    const fetchMe = async () => {
        try {
            const res = await api.get("/auth/me");
            setMe(res.data);
            setNickname(res.data.nickname || "");
        } catch (err) {
            console.error("프로필 조회 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    // 닉네임 변경
    const handleUpdateProfile = async () => {
        if (!nickname.trim()) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        setSavingProfile(true);
        try {
            const res = await api.patch("/auth/me", {
                nickname: nickname.trim(),
            });
            // 컨트롤러에서 { message, user } 형식으로 내려준다고 가정
            const updatedUser = res.data.user ?? res.data;
            setMe(updatedUser);
            alert("프로필이 수정되었습니다.");
        } catch (err: any) {
            console.error("프로필 수정 실패:", err?.response?.data || err);
            alert(err?.response?.data?.message || "프로필 수정에 실패했습니다.");
        } finally {
            setSavingProfile(false);
        }
    };

    // 비밀번호 변경
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            alert("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
            return;
        }

        setSavingPassword(true);
        try {
            await api.patch("/auth/password", {
                currentPassword,
                newPassword,
            });
            alert("비밀번호가 변경되었습니다.");
            setCurrentPassword("");
            setNewPassword("");
        } catch (err: any) {
            console.error("비밀번호 변경 실패:", err?.response?.data || err);
            alert(err?.response?.data?.message || "비밀번호 변경에 실패했습니다.");
        } finally {
            setSavingPassword(false);
        }
    };

    // 회원 탈퇴
    const handleDeleteAccount = async () => {
        if (!confirm("정말 탈퇴하시겠어요? 기록은 복구할 수 없어요.")) return;

        setDeleting(true);
        try {
            await api.delete("/auth/delete");
            alert("회원 탈퇴가 완료되었습니다.");

            // TODO: 토큰 삭제 + 로그인 페이지로 이동
            // 예: localStorage.removeItem("token"); router.push("/auth/login");
        } catch (err: any) {
            console.error("회원 탈퇴 실패:", err?.response?.data || err);
            alert(err?.response?.data?.message || "회원 탈퇴에 실패했습니다.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageTitle
                title="마이 페이지"
                description="프로필 정보와 계정 설정을 관리할 수 있어요."
            />

            {loading ? (
                <p className="text-sm text-zinc-500">프로필을 불러오는 중입니다...</p>
            ) : !me ? (
                <p className="text-sm text-zinc-500">
                    프로필 정보를 불러오지 못했어요. 다시 로그인해 주세요.
                </p>
            ) : (
                <>
                    {/* 프로필 정보 + 닉네임 */}
                    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
                        <h2 className="text-xs font-medium text-zinc-500">프로필 정보</h2>

                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-[11px] text-zinc-400">이메일</p>
                                <p className="text-zinc-800">{me.email}</p>
                            </div>
                            <div>
                                <p className="text-[11px] text-zinc-400">닉네임</p>
                                <div className="mt-1 flex gap-2">
                                    <input
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm focus:border-zinc-400 focus:outline-none"
                                        placeholder="닉네임을 입력하세요"
                                    />
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={savingProfile}
                                        className="flex h-[36px] shrink-0 items-center justify-center rounded-md bg-[#F3F4F6] px-4 text-xs font-medium text-zinc-900 whitespace-nowrap hover:bg-zinc-200 disabled:opacity-50"
                                    >
                                        {savingProfile ? "저장 중..." : "저장"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 비밀번호 변경 */}
                    <section className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
                        <h2 className="text-xs font-medium text-zinc-500">비밀번호 변경</h2>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-[11px] text-zinc-400">현재 비밀번호</p>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm focus:border-zinc-400 focus:outline-none"
                                />
                            </div>
                            <div>
                                <p className="text-[11px] text-zinc-400">새 비밀번호</p>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full rounded-md border border-zinc-200 px-2 py-1 text-sm focus:border-zinc-400 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={handleChangePassword}
                                disabled={savingPassword}
                                className="rounded-md bg-[#F3F4F6] px-4 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-200 disabled:opacity-50"
                            >
                                {savingPassword ? "변경 중..." : "비밀번호 변경"}
                            </button>
                        </div>
                    </section>

                    {/* 회원 탈퇴 */}
                    <section className="space-y-3 rounded-xl border border-red-100 bg-red-50 p-4">
                        <h2 className="text-xs font-medium text-red-500">위험 구역</h2>
                        <p className="text-xs text-red-500">
                            계정을 삭제하면 Growlog에 저장된 감정, 회고, 할 일 기록이 모두 삭제될 수 있어요.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleting}
                            className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                        >
                            {deleting ? "탈퇴 중..." : "회원 탈퇴"}
                        </button>
                    </section>
                </>
            )}
        </div>
    );
}