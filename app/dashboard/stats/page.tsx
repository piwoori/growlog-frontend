"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { PageTitle } from "@/components/layout/PageTitle";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";

interface TodoStats {
    total: number;
    completed: number;
    rate: number; // 0~100
}

export default function StatsPage() {
    const [todoStats, setTodoStats] = useState<TodoStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.get("/todos/statistics");
            setTodoStats(res.data as TodoStats);
        } catch (err: any) {
            console.error("통계 조회 실패:", err?.response?.data || err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "통계를 불러오지 못했어요.";
            setError(msg);
            setTodoStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <PageTitle
                title="통계"
                description="할 일 달성률과 기록 데이터를 한눈에 확인할 수 있어요."
            />

            <div className="grid gap-4 md:grid-cols-2">
                {/* ✅ 할 일 달성률 카드 */}
                <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-zinc-500">할 일 달성률</p>
                            <p className="text-sm text-zinc-500">
                                전체 기간 기준, 지금까지 완료한 비율이에요.
                            </p>
                        </div>
                        <button
                            onClick={fetchStats}
                            className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 hover:bg-zinc-50"
                        >
                            새로고침
                        </button>
                    </div>

                    {/* 에러가 있으면 여기 고정 */}
                    {error && <ErrorState message={error} />}

                    {loading ? (
                        <Spinner />
                    ) : !todoStats ? (
                        <p className="text-sm text-zinc-500">
                            통계 데이터를 불러오지 못했어요.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-baseline justify-between">
                                <p className="text-lg font-semibold text-zinc-900">
                                    {todoStats.total === 0
                                        ? "아직 등록된 할 일이 없어요."
                                        : `${todoStats.total}개 중 ${todoStats.completed}개 완료`}
                                </p>
                                {todoStats.total > 0 && (
                                    <p className="text-sm font-medium text-indigo-600">
                                        {todoStats.rate}%
                                    </p>
                                )}
                            </div>

                            {todoStats.total > 0 && (
                                <>
                                    <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-100">
                                        <div
                                            className="h-full rounded-full bg-indigo-500 transition-all"
                                            style={{ width: `${todoStats.rate}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Growlog에 기록한 모든 할 일 중 완료한 비율이에요.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* 감정 / 회고 통계 자리 (추후 확장용) */}
                <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5">
                    <p className="text-xs font-medium text-zinc-500">감정 & 회고 통계</p>
                    <p className="text-sm text-zinc-500">
                        감정 기록 빈도, 긍/부정 비율, 회고 작성 일수 등은 이후 버전에서
                        추가할 예정이에요.
                        <br />
                        백엔드에서 기간별 조회 API가 준비되면 이 영역에 그래프를 붙이면 딱
                        좋겠어!
                    </p>
                </div>
            </div>
        </div>
    );
}