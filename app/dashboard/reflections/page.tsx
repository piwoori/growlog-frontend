"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { PageTitle } from "@/components/layout/PageTitle";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";

interface Reflection {
    id: number;
    content: string;
    date: string;
    createdAt?: string;
    updatedAt?: string;
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

export default function ReflectionsPage() {
    const [date, setDate] = useState(getTodayString());
    const [content, setContent] = useState("");
    const [currentReflection, setCurrentReflection] = useState<Reflection | null>(
        null
    );

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ✅ 특정 날짜 회고 조회
    const fetchReflection = async (targetDate: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.get("/reflections", {
                params: { date: targetDate },
            });

            const data = res.data;
            let reflection: Reflection | null = null;

            // 응답이 배열인 경우 / { reflections: [...] } 인 경우 모두 처리
            if (Array.isArray(data)) {
                reflection = data.length > 0 ? (data[0] as Reflection) : null;
            } else if (Array.isArray(data?.reflections)) {
                reflection =
                    data.reflections.length > 0
                        ? (data.reflections[0] as Reflection)
                        : null;
            } else if (data && typeof data === "object") {
                // 이미 단일 회고 객체를 주는 경우
                reflection = data as Reflection;
            }

            setCurrentReflection(reflection);
            setContent(reflection?.content ?? "");
        } catch (err: any) {
            console.error("회고 조회 실패:", err?.response?.data || err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "회고를 불러오지 못했어요.";
            setError(msg);
            setCurrentReflection(null);
            setContent("");
        } finally {
            setLoading(false);
        }
    };

    // ✅ 회고 저장 (없으면 생성, 있으면 수정)
    const handleSave = async () => {
        if (!content.trim()) {
            alert("회고 내용을 입력해주세요.");
            return;
        }

        setSaving(true);
        try {
            if (!currentReflection) {
                // 아직 해당 날짜 회고가 없으면 새로 생성
                await api.post("/reflections", {
                    content: content.trim(),
                    date, // 백엔드가 date를 body에서 받는 경우
                });
                alert("회고를 기록했어요.");
            } else {
                // 이미 있으면 수정 (RESTful 기준 /reflections/:id)
                await api.patch(`/reflections/${currentReflection.id}`, {
                    content: content.trim(),
                });
                alert("회고를 수정했어요.");
            }

            // 다시 조회해서 상태 동기화
            fetchReflection(date);
        } catch (err: any) {
            console.error("회고 저장 실패:", err?.response?.data || err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "회고 저장에 실패했어요.";
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    // 날짜 변경 시마다 회고 불러오기
    useEffect(() => {
        fetchReflection(date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    const today = getTodayString();

    return (
        <div className="space-y-6">
            {/* 상단 타이틀 + 날짜 선택 */}
            <div className="flex items-center justify-between gap-4">
                <PageTitle
                    title="회고"
                    description="하루를 돌아보며 느낀 점과 배운 점을 짧게 기록해 보세요."
                />

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500">날짜</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded-md border border-zinc-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* 회고 작성 카드 */}
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
                {/* 공통 에러 영역 */}
                {error && <ErrorState message={error} />}

                {loading ? (
                    <Spinner />
                ) : (
                    <>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-zinc-800">
                                {date === today ? "오늘의 회고" : "선택한 날짜의 회고"}
                            </p>
                            {currentReflection ? (
                                <p className="text-xs text-zinc-500">
                                    이 날의 회고는 이미 기록되어 있어요. 내용을 수정할 수 있어요.
                                </p>
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    아직 회고가 기록되지 않았어요. 오늘 있었던 일이나 느낀 점을
                                    남겨보세요.
                                </p>
                            )}
                        </div>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                            placeholder="예: 오늘은 Growlog의 할 일 기능을 완성했다. 프론트–백엔드 연동에 조금 헤맸지만, 구조를 잡고 나니 다른 기능도 금방 붙일 수 있을 것 같았다."
                            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "저장 중..."
                                    : currentReflection
                                        ? "회고 수정하기"
                                        : "회고 기록하기"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}