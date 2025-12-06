"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { PageTitle } from "@/components/layout/PageTitle";

import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    PieChart,
    Pie,
    Cell,
} from "recharts";

interface EmotionStats {
    [emoji: string]: number;
}

interface TodoStats {
    total: number;
    completed: number;
    completionRate: number;
}

interface SummaryStats {
    emotionStats: EmotionStats;
    todoStats: TodoStats;
    aiAggregate?: {
        positive: number;
        neutral: number;
        negative: number;
    };
    aiSampleCount?: number;
}

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

const AI_PIE_COLORS = {
    positive: "#C8BBE3", // 보라 ash
    neutral: "#C8CBD1", // 그레이 ash
    negative: "#E2B4B4", // 레드 ash
};

const getTodayString = () => new Date().toISOString().slice(0, 10);

export default function StatsPage() {
    const [stats, setStats] = useState<SummaryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const today = getTodayString();

    const fetchStats = async (targetDate: string) => {
        setLoading(true);
        try {
            const res = await api.get("/stats/summary", {
                params: { date: targetDate, period: "weekly" },
            });
            setStats(res.data as SummaryStats);
        } catch (err: any) {
            console.error("통계 조회 실패:", err?.response?.data || err);
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(today);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 감정 막대 그래프 데이터
    const emotionChartData =
        stats &&
        Object.entries(stats.emotionStats || {}).map(([emoji, count]) => ({
            emoji,
            count,
        }));

    // 할 일 주간 완료율
    const weeklyTodoRate = stats?.todoStats?.completionRate ?? 0;

    // AI 도넛 차트 데이터
    const aiAgg = stats?.aiAggregate;
    const aiSampleCount = stats?.aiSampleCount ?? 0;
    const aiSum =
        (aiAgg?.positive ?? 0) + (aiAgg?.neutral ?? 0) + (aiAgg?.negative ?? 0);

    // ✅ "최소 1개의 AI 분석 데이터만 있어도" 도넛을 보여주도록 조건 완화
    const hasAiData = aiSampleCount > 0 && aiSum > 0;

    const aiPieData = hasAiData
        ? [
            { name: "긍정", key: "positive", value: aiAgg!.positive },
            { name: "중립", key: "neutral", value: aiAgg!.neutral },
            { name: "부정", key: "negative", value: aiAgg!.negative },
        ]
        : [];

    return (
        <div className="space-y-8">
            <PageTitle
                title="통계"
                description="최근 1주일 동안의 감정 패턴과 할 일 완료율을 한 눈에 볼 수 있어요."
            />

            {loading ? (
                <p className="text-sm text-zinc-500">통계를 불러오는 중입니다...</p>
            ) : !stats ? (
                <p className="text-sm text-zinc-500">
                    통계 데이터를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
                </p>
            ) : (
                <>
                    {/* 상단: 감정 분포 + AI 비율 */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* 감정 분포 막대 그래프 */}
                        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-zinc-500">
                                    이번 주 감정 분포
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                    기준일: {today.replace(/-/g, ". ")}
                                </p>
                            </div>

                            {emotionChartData && emotionChartData.length > 0 ? (
                                <div className="h-56">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={emotionChartData}>
                                            <XAxis dataKey="emoji" />
                                            <Tooltip
                                                formatter={(value) => [`${value}회`, "기록 횟수"]}
                                            />
                                            <Bar
                                                dataKey="count"
                                                radius={[8, 8, 0, 0]}
                                                fill="#A5B4FC"
                                            >
                                                {emotionChartData.map((entry, index) => {
                                                    const color =
                                                        EMOJI_COLOR_MAP[entry.emoji] || "#A5B4FC";
                                                    return <Cell key={index} fill={color} />;
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    최근 1주일 간 기록된 감정이 없어요.
                                </p>
                            )}
                        </div>

                        {/* AI 기반 감정 비율 도넛 */}
                        <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-zinc-500">
                                    AI 기반 감정 비율
                                </p>
                                <p className="text-[11px] text-zinc-400">
                                    분석된 메모: {aiSampleCount}개
                                </p>
                            </div>

                            {hasAiData ? (
                                <div className="flex items-center gap-4">
                                    <div className="h-40 w-40">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={aiPieData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius="70%"
                                                    outerRadius="100%"
                                                    paddingAngle={2}
                                                >
                                                    {aiPieData.map((entry, index) => {
                                                        const key = entry.key as keyof typeof AI_PIE_COLORS;
                                                        const color = AI_PIE_COLORS[key] || "#E5E7EB";
                                                        return <Cell key={`ai-slice-${index}`} fill={color} />;
                                                    })}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-1 text-xs text-zinc-600">
                                        <p className="text-sm font-semibold text-zinc-900">
                                            한 주 동안의 AI 감정 요약
                                        </p>
                                        <p>긍정: {aiAgg!.positive}%</p>
                                        <p>중립: {aiAgg!.neutral}%</p>
                                        <p>부정: {aiAgg!.negative}%</p>
                                        <p className="mt-1 text-[11px] text-zinc-400">
                                            * 작성한 텍스트를 기반으로 한 AI 분석 결과로, 실제 기분과
                                            다를 수도 있어요.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-zinc-500">
                                    아직 AI 감정 분석 결과가 충분하지 않아요. 감정 메모를 남기면
                                    자동으로 분석돼요.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 하단: 주간 할 일 완료율 */}
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
                                <p>이번 주 전체 할 일: {stats.todoStats.total}개</p>
                                <p>완료된 할 일: {stats.todoStats.completed}개</p>
                                <p className="text-[11px] text-zinc-500">
                                    한 주 동안의 평균 완료율이에요.
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}