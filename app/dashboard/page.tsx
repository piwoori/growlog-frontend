"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Emotion {
    id: number;
    emoji: string;
    note?: string | null;
    date: string;
}

interface Reflection {
    id: number;
    content: string;
    date: string;
}

interface TodoStats {
    total: number;
    completed: number;
    rate: number; // %
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

export default function DashboardHomePage() {
    const [emotion, setEmotion] = useState<Emotion | null>(null);
    const [reflection, setReflection] = useState<Reflection | null>(null);
    const [todoStats, setTodoStats] = useState<TodoStats | null>(null);

    const [loading, setLoading] = useState(true);
    const today = getTodayString();

    const loadSummary = async () => {
        setLoading(true);
        try {
            // 1) 오늘 감정
            const [emotionRes, reflectionRes, todoStatsRes] = await Promise.all([
                api.get("/emotions", { params: { date: today } }),
                api.get("/reflections", { params: { date: today } }),
                api.get("/todos/statistics"),
            ]);

            // 감정: { emotions: [...] }
            const eData = emotionRes.data;
            let e: Emotion | null = null;
            if (Array.isArray(eData?.emotions)) {
                e = eData.emotions.length > 0 ? (eData.emotions[0] as Emotion) : null;
            } else if (Array.isArray(eData)) {
                e = eData.length > 0 ? (eData[0] as Emotion) : null;
            } else if (eData && typeof eData === "object") {
                e = eData as Emotion;
            }
            setEmotion(e);

            // 회고: 배열 / {reflections: [...] } / 단일 객체 방어
            const rData = reflectionRes.data;
            let r: Reflection | null = null;
            if (Array.isArray(rData?.reflections)) {
                r =
                    rData.reflections.length > 0
                        ? (rData.reflections[0] as Reflection)
                        : null;
            } else if (Array.isArray(rData)) {
                r = rData.length > 0 ? (rData[0] as Reflection) : null;
            } else if (rData && typeof rData === "object") {
                r = rData as Reflection;
            }
            setReflection(r);

            // 할 일 통계: { total, completed, rate }
            setTodoStats(todoStatsRes.data as TodoStats);
        } catch (err) {
            console.error("오늘 요약 불러오기 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSummary();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold text-zinc-900">오늘 요약</h2>
                <p className="text-sm text-zinc-600">
                    오늘의 감정, 회고, 할 일 진행 상황을 한 번에 볼 수 있어요.
                </p>
            </div>

            {loading ? (
                <p className="text-sm text-zinc-500">오늘 데이터를 불러오는 중입니다...</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    {/* 감정 카드 */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2">
                        <p className="text-xs font-medium text-zinc-500">오늘의 감정</p>
                        {emotion ? (
                            <>
                                <p className="text-3xl">{emotion.emoji}</p>
                                {emotion.note && (
                                    <p className="text-xs text-zinc-600 break-words">
                                        {emotion.note}
                                    </p>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-zinc-500">
                                아직 감정이 기록되지 않았어요.{" "}
                                <span className="underline underline-offset-2">
                  왼쪽 메뉴의 &lsquo;감정&rsquo;에서 기록해 보세요.
                </span>
                            </p>
                        )}
                    </div>

                    {/* 회고 카드 */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2">
                        <p className="text-xs font-medium text-zinc-500">오늘의 회고</p>
                        {reflection ? (
                            <p className="text-sm text-zinc-700 whitespace-pre-wrap break-words line-clamp-6">
                                {reflection.content}
                            </p>
                        ) : (
                            <p className="text-sm text-zinc-500">
                                아직 회고가 기록되지 않았어요.{" "}
                                <span className="underline underline-offset-2">
                  &lsquo;회고&rsquo; 페이지에서 오늘을 정리해 보세요.
                </span>
                            </p>
                        )}
                    </div>

                    {/* 할 일 카드 */}
                    <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-2">
                        <p className="text-xs font-medium text-zinc-500">할 일 진행률</p>
                        {todoStats ? (
                            <>
                                <p className="text-lg font-semibold text-zinc-900">
                                    {todoStats.total === 0
                                        ? "등록된 할 일이 없어요."
                                        : `${todoStats.total}개 중 ${todoStats.completed}개 완료`}
                                </p>
                                {todoStats.total > 0 && (
                                    <div className="space-y-2">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{ width: `${todoStats.rate}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-500">
                                            오늘의 완료율 {todoStats.rate}%
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-zinc-500">
                                할 일 통계를 불러오지 못했어요.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}