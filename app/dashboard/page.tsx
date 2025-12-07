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
    Cell,
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

    positive?: number | null;
    neutral?: number | null;
    negative?: number | null;
    aiLabel?: string | null;
    aiModel?: string | null;
    aiVersion?: string | null;

    aiAdvice?: string | null;
    aiAdviceModel?: string | null;
    aiAdviceSource?: string | null;
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

// ✅ 통계 페이지랑 맞춘 이모지 색상 맵
const EMOJI_COLOR_MAP: Record<string, string> = {
    "😄": "#C8BBE3", // 보라 ash
    "🙂": "#EAC7D7", // 분홍 ash
    "😐": "#C8CBD1", // 그레이 ash
    "😢": "#AFC6DF", // 블루 ash
    "😡": "#E2B4B4", // 레드 ash
    "😴": "#B7D3BE", // 초록 ash
    "🤩": "#E7DAA7", // 앰버 ash
};

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
        null,
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

            {/* 오늘 요약 카드 섹션 */}
            {loading ? (
                <p className="text-sm text-zinc-500">
                    오늘 데이터를 불러오는 중입니다...
                </p>
            ) : (
                <div className="grid items-stretch gap-4 md:grid-cols-[3fr_2fr]">
                    {/* ░░ 왼쪽: 오늘의 감정 (세로 전체 사용) ░░ */}
                    <div className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                        <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                            <p className="font-medium">오늘의 감정</p>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-600">
                                감정 · 회고 연동
                            </span>
                        </div>

                        {emotion ? (
                            <>
                                {/* 위쪽: 이모지 + 메모 요약 */}
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{emotion.emoji}</span>
                                    {emotion.note && (
                                        <p className="line-clamp-3 text-sm text-zinc-700">
                                            {emotion.note}
                                        </p>
                                    )}
                                </div>

                                {/* 아래쪽: AI 분석 박스 */}
                                {(aiLabelText || hasAiScores) && (
                                    <div className="mt-4 space-y-2 rounded-2xl bg-indigo-50/80 px-3 py-3 text-xs text-zinc-700">
                                        {/* 헤더 라인 */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-indigo-500">
                                                AI
                                            </span>
                                            <p className="text-[11px] font-semibold text-zinc-800">
                                                AI 감정 분석
                                            </p>
                                            {aiLabelText && (
                                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-600">
                                                    {aiLabelText} 경향
                                                </span>
                                            )}
                                        </div>

                                        {/* 요약 문장 */}
                                        {aiLabelText && (
                                            <p className="text-[11px] leading-relaxed text-zinc-700">
                                                메모를 기반으로 볼 때, 오늘 하루는{" "}
                                                <span className="font-semibold text-zinc-900">
                                                    {aiLabelText} 쪽에 조금 더 가까운 날
                                                </span>
                                                이었어요.
                                            </p>
                                        )}

                                        {/* 점수 뱃지들 */}
                                        {hasAiScores && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {aiPos !== null && (
                                                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] text-zinc-700">
                                                        긍정 {aiPos}%
                                                    </span>
                                                )}
                                                {aiNeu !== null && (
                                                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] text-zinc-700">
                                                        중립 {aiNeu}%
                                                    </span>
                                                )}
                                                {aiNeg !== null && (
                                                    <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-[11px] text-zinc-700">
                                                        부정 {aiNeg}%
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <p className="text-[10px] leading-relaxed text-zinc-500">
                                            * 메모 내용을 기반으로 AI가 분석한 결과예요. 실제 기분과는
                                            다를 수도 있어요.
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

                    {/* ░░ 오른쪽: 회고 + 할 일 (위/아래 카드 높이 동일) ░░ */}
                    <div className="flex h-full flex-col space-y-4">
                        {/* 오늘의 회고 카드 */}
                        <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                            <p className="text-xs font-medium text-zinc-500">오늘의 회고</p>
                            <div className="flex-1">
                                {reflection ? (
                                    <p className="line-clamp-6 break-words whitespace-pre-wrap text-xs text-zinc-700 md:text-sm">
                                        {reflection.content}
                                    </p>
                                ) : (
                                    <p className="text-xs text-zinc-500 md:text-sm">
                                        아직 회고가 기록되지 않았어요.{" "}
                                        <span className="underline underline-offset-2">
                                            &lsquo;회고&rsquo; 페이지에서 오늘을 정리해 보세요.
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 할 일 진행률 카드 */}
                        <div className="flex flex-1 flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                            <p className="text-xs font-medium text-zinc-500">할 일 진행률</p>

                            {todayTodoStats ? (
                                <>
                                    <p className="text-sm font-semibold text-zinc-900">
                                        {todayTodoStats.total === 0 ? (
                                            <>등록된 할 일이 없어요.</>
                                        ) : (
                                            <>
                                                <span className="whitespace-nowrap">
                                                    {todayTodoStats.total}개
                                                </span>{" "}
                                                중{" "}
                                                <span className="whitespace-nowrap">
                                                    {todayTodoStats.completed}개
                                                </span>{" "}
                                                완료
                                            </>
                                        )}
                                    </p>

                                    {todayTodoStats.total > 0 && (
                                        <div className="mt-1 space-y-2">
                                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                                                <div
                                                    className="h-full rounded-full bg-indigo-500 transition-all"
                                                    style={{ width: `${todayTodoStats.rate}%` }}
                                                />
                                            </div>
                                            <p className="text-right text-xs text-zinc-500 md:text-left">
                                                오늘의 완료율{" "}
                                                <span className="whitespace-nowrap">
                                                    {todayTodoStats.rate}%
                                                </span>
                                                .
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    할 일 통계를 불러오지 못했어요.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ---------------- 통계 섹션 (이번 주 감정 & 할 일) ---------------- */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-zinc-900">이번 주 통계</h3>
                    <p className="text-xs text-zinc-500">
                        최근 1주일 동안의 감정 패턴과 할 일 완료율이에요.
                    </p>
                </div>

                {loadingStats ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-500 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                        통계를 불러오는 중입니다...
                    </div>
                ) : !stats ? (
                    <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-xs text-zinc-500 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                        아직 통계 데이터가 없어요. 감정과 할 일을 기록해 보세요.
                    </div>
                ) : (
                    <div className="grid items-stretch gap-4 md:grid-cols-3">
                        {/* 감정 빈도 차트 */}
                        <div className="flex h-full flex-col space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                            <p className="text-xs font-medium text-zinc-500">
                                이번 주 감정 분포
                            </p>
                            {emotionChartData && emotionChartData.length > 0 ? (
                                <div className="mt-1 h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={emotionChartData}>
                                            <XAxis dataKey="emoji" />
                                            <Tooltip
                                                formatter={(value) => [`${value}회`, "기록 횟수"]}
                                            />
                                            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                                {emotionChartData.map((entry, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={
                                                            EMOJI_COLOR_MAP[entry.emoji] ??
                                                            "#D1D5DB"
                                                        }
                                                    />
                                                ))}
                                            </Bar>
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
                        <div className="flex h-full flex-col space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)] md:col-span-2">
                            <p className="text-xs font-medium text-zinc-500">
                                이번 주 평균 할 일 완료율
                            </p>

                            <div className="mt-1 flex flex-1 items-center justify-between gap-4">
                                <div className="h-40 w-40 shrink-0">
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
                                            <RadialBar
                                                background
                                                dataKey="value"
                                                cornerRadius={10}
                                                fill="#9CA3AF" // 그레이 400
                                            />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="space-y-1 text-right text-xs text-zinc-600">
                                    <p className="text-sm font-semibold text-zinc-900">
                                        {weeklyTodoRate}% 완료
                                    </p>
                                    <p className="whitespace-nowrap">
                                        이번 주 전체 할 일: {stats.todoStats.total}개
                                    </p>
                                    <p className="whitespace-nowrap">
                                        완료된 할 일: {stats.todoStats.completed}개
                                    </p>
                                    <p className="text-[11px] text-zinc-500">
                                        한 주 동안의 평균 완료율이에요.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}