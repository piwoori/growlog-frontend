"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/layout/PageTitle";

// 📊 Recharts
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
} from "recharts";

interface EmotionStats {
    [emoji: string]: number;
}

interface SummaryTodoStats {
    total: number;
    completed: number;
    completionRate: number;
}

interface SummaryStats {
    emotionStats: EmotionStats;
    todoStats: SummaryTodoStats;
}

interface Emotion {
    id: number;
    emoji: string;
    note?: string | null;
    date: string;

    // ✅ AI 감정 분석 결과
    aiLabel?: string | null;
    positive?: number | null;
    neutral?: number | null;
    negative?: number | null;
}

interface Reflection {
    id: number;
    content: string;
    date: string;
}

// 오늘 할 일 통계 응답 타입 (/todos/statistics)
interface TodayTodoStats {
    total: number;
    completed: number;
    rate: number; // %
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

// AI 라벨 한글 매핑
const AI_LABEL_MAP: Record<string, string> = {
    positive: "긍정",
    negative: "부정",
    neutral: "중립",
};

const toPercent = (v?: number | null) =>
    typeof v === "number" ? Math.round(v * 100) : null;

export default function DashboardHomePage() {
    const [stats, setStats] = useState<SummaryStats | null>(null); // 주간 통계 (차트용)
    const [loadingStats, setLoadingStats] = useState(false);

    const [emotion, setEmotion] = useState<Emotion | null>(null);
    const [reflection, setReflection] = useState<Reflection | null>(null);
    const [todayTodoStats, setTodayTodoStats] = useState<TodayTodoStats | null>(
        null
    );

    const [loading, setLoading] = useState(true);

    const today = getTodayString();

    // ✅ 통계(/stats/summary) 불러오기 - 주간 차트용 데이터
    const fetchStats = async (targetDate: string) => {
        try {
            setLoadingStats(true);

            const res = await api.get("/stats/summary", {
                params: { date: targetDate, period: "weekly" },
            });

            setStats(res.data as SummaryStats);
        } catch (err: any) {
            console.error("통계 조회 실패:", err?.response?.data || err);
        } finally {
            setLoadingStats(false);
        }
    };

    // ✅ 오늘 감정 / 회고 / 할 일 요약 불러오기
    const loadSummary = async () => {
        setLoading(true);
        try {
            const [emotionRes, reflectionRes, todoStatsRes] = await Promise.all([
                api.get("/emotions", { params: { date: today } }),
                api.get("/reflections", { params: { date: today } }),
                api.get("/todos/statistics", { params: { date: today } }),
            ]);

            // 감정: { emotions: [...] } or [...]
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

            // 회고: { reflections: [...] } or [...]
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

            // 오늘 할 일 통계: { total, completed, rate }
            setTodayTodoStats(todoStatsRes.data as TodayTodoStats);
        } catch (err) {
            console.error("오늘 요약 불러오기 실패:", err);
        } finally {
            setLoading(false);
        }
    };

    // 처음 진입 시 오늘 요약 + 통계 함께 호출
    useEffect(() => {
        loadSummary();
        fetchStats(today);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 📊 감정 통계 차트용 데이터 변환
    const emotionChartData =
        stats &&
        Object.entries(stats.emotionStats).map(([emoji, count]) => ({
            emoji,
            count,
        }));

    // 📊 할 일 통계 (주간 평균 완료율)
    const weeklyTodoRate = stats?.todoStats?.completionRate ?? 0;

    // ✅ 현재 감정의 AI 분석 퍼센트 계산
    const aiPos = toPercent(emotion?.positive);
    const aiNeu = toPercent(emotion?.neutral);
    const aiNeg = toPercent(emotion?.negative);
    const hasAiScores = aiPos !== null || aiNeu !== null || aiNeg !== null;
    const aiLabelText =
        emotion?.aiLabel && AI_LABEL_MAP[emotion.aiLabel]
            ? AI_LABEL_MAP[emotion.aiLabel]
            : emotion?.aiLabel ?? null;

    return (
        <div className="space-y-8">
            {/* 상단 타이틀 */}
            <PageTitle
                title="오늘 요약"
                description="오늘의 감정, 회고, 할 일 진행 상황을 한 번에 볼 수 있어요."
            />

            {/* 오늘 요약 카드 3개 */}
            {loading ? (
                <p className="text-sm text-zinc-500">
                    오늘 데이터를 불러오는 중입니다...
                </p>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    {/* 감정 카드 */}
                    <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4">
                        <p className="text-xs font-medium text-zinc-500">오늘의 감정</p>
                        {emotion ? (
                            <>
                                <p className="text-3xl">{emotion.emoji}</p>
                                {emotion.note && (
                                    <p className="break-words text-xs text-zinc-600">
                                        {emotion.note}
                                    </p>
                                )}

                                {(aiLabelText || hasAiScores) && (
                                    <div className="mt-3 space-y-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-zinc-700">
                                        <p className="font-medium text-zinc-800">AI 감정 분석</p>

                                        {aiLabelText && (
                                            <p>
                                                분석 결과:{" "}
                                                <span className="font-semibold">{aiLabelText}</span>{" "}
                                                경향
                                            </p>
                                        )}

                                        {hasAiScores && (
                                            <p className="text-[11px] text-zinc-600">
                                                {aiPos !== null && <>긍정 {aiPos}% · </>}
                                                {aiNeu !== null && <>중립 {aiNeu}% · </>}
                                                {aiNeg !== null && <>부정 {aiNeg}%</>}
                                            </p>
                                        )}

                                        <p className="text-[11px] text-zinc-500">
                                            * 메모 내용을 기반으로 AI가 분석한 결과예요. 실제 기분과 다를 수도
                                            있어요.
                                        </p>
                                    </div>
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
                    <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4">
                        <p className="text-xs font-medium text-zinc-500">오늘의 회고</p>
                        {reflection ? (
                            <p className="line-clamp-6 break-words whitespace-pre-wrap text-sm text-zinc-700">
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
                    <div className="space-y-2 rounded-xl border border-zinc-200 bg-white p-4">
                        <p className="text-xs font-medium text-zinc-500">할 일 진행률</p>
                        {todayTodoStats ? (
                            <>
                                <p className="text-lg font-semibold text-zinc-900">
                                    {todayTodoStats.total === 0
                                        ? "등록된 할 일이 없어요."
                                        : `${todayTodoStats.total}개 중 ${todayTodoStats.completed}개 완료`}
                                </p>
                                {todayTodoStats.total > 0 && (
                                    <div className="space-y-2">
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                                            <div
                                                className="h-full rounded-full bg-indigo-500 transition-all"
                                                style={{ width: `${todayTodoStats.rate}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-500">
                                            오늘의 완료율 {todayTodoStats.rate}%.
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

            {/* ---------------- 통계 섹션 (이번 주 감정 & 할 일) ---------------- */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-zinc-900">
                        이번 주 통계
                    </h3>
                    <p className="text-xs text-zinc-500">
                        최근 1주일 동안의 감정 패턴과 할 일 완료율이에요.
                    </p>
                </div>

                {loadingStats ? (
                    <p className="text-xs text-zinc-500">
                        통계를 불러오는 중입니다...
                    </p>
                ) : !stats ? (
                    <p className="text-xs text-zinc-500">
                        아직 통계 데이터가 없어요. 감정과 할 일을 기록해 보세요.
                    </p>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* 감정 빈도 차트 */}
                        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
                            <p className="text-xs font-medium text-zinc-500">
                                이번 주 감정 분포
                            </p>
                            {emotionChartData && emotionChartData.length > 0 ? (
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={emotionChartData}>
                                            <XAxis dataKey="emoji" />
                                            <Tooltip
                                                formatter={(value) => [`${value}회`, "기록 횟수"]}
                                            />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    최근 일주일간 기록된 감정이 없어요.
                                </p>
                            )}
                        </div>

                        {/* 할 일 완료율 도넛 차트 */}
                        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
                            <p className="text-xs font-medium text-zinc-500">
                                이번 주 평균 할 일 완료율
                            </p>
                            <div className="flex items-center justify-between gap-4">
                                <div className="h-40 w-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart
                                            data={[{ name: "완료율", value: weeklyTodoRate }]}
                                            innerRadius="70%"
                                            outerRadius="100%"
                                            startAngle={180}
                                            endAngle={-180}
                                        >
                                            <PolarAngleAxis
                                                type="number"
                                                domain={[0, 100]}
                                                dataKey="value"
                                                tick={false}
                                            />
                                            <RadialBar background dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="space-y-1 text-right text-xs text-zinc-600">
                                    <p className="text-sm font-semibold text-zinc-900">
                                        {weeklyTodoRate}% 완료
                                    </p>
                                    <p>이번 주 전체 할 일: {stats.todoStats.total}개</p>
                                    <p>완료된 할 일: {stats.todoStats.completed}개</p>
                                    <p className="text-[11px] text-zinc-500">
                                        한 주 동안의 평균 완료율이에요.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}