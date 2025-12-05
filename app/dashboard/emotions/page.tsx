"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

import { PageTitle } from "@/components/layout/PageTitle";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";

interface Emotion {
    id: number;
    emoji: string;
    note?: string | null; // 메모 필드
    date: string;
    createdAt?: string;
    updatedAt?: string;

    // 🔮 AI 분석 필드
    aiLabel?: string | null;
    positive?: number | null;
    neutral?: number | null;
    negative?: number | null;
}

const EMOJIS = ["😄", "🙂", "😐", "😢", "😡", "😴", "🤩"];

const getTodayString = () => new Date().toISOString().slice(0, 10);

// AI label → 한글 라벨 변환
const getKoreanLabel = (label?: string | null) => {
    if (!label) return null;
    const lower = label.toLowerCase();
    if (lower.includes("pos")) return "긍정";
    if (lower.includes("neu")) return "중립";
    if (lower.includes("neg")) return "부정";
    return label; // 모르는 라벨이면 그대로 보여주기
};

// 점수 포맷 (소수점 2자리)
const formatScore = (score?: number | null) =>
    typeof score === "number" ? score.toFixed(2) : "-";

export default function EmotionsPage() {
    const [date, setDate] = useState(getTodayString());
    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);

    // ✅ 특정 날짜 감정 조회
    const fetchEmotion = async (targetDate: string) => {
        setLoading(true);
        setError(null);

        try {
            const res = await api.get("/emotions", {
                params: { date: targetDate },
            });

            const list = res.data?.emotions;
            let emotion: Emotion | null = null;

            if (Array.isArray(list) && list.length > 0) {
                emotion = list[0] as Emotion;
            }

            setCurrentEmotion(emotion);
            setSelectedEmoji(emotion?.emoji ?? null);
            setNote(emotion?.note ?? "");
        } catch (err: any) {
            console.error("감정 조회 실패:", err?.response?.data || err);

            setCurrentEmotion(null);
            setSelectedEmoji(null);
            setNote("");

            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "감정을 불러오지 못했어요.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ✅ 감정 저장 (없으면 생성, 있으면 수정)
    const handleSave = async () => {
        if (!selectedEmoji) {
            alert("오늘의 감정을 이모지로 선택해주세요!");
            return;
        }

        setSaving(true);
        try {
            if (currentEmotion) {
                // 기존 감정 수정: /emotions/:id + emoji, note
                await api.patch(`/emotions/${currentEmotion.id}`, {
                    emoji: selectedEmoji,
                    note,
                });
                alert("오늘 감정을 수정했어요.");
            } else {
                // 새 감정 생성: /emotions + emoji, date, note
                await api.post("/emotions", {
                    emoji: selectedEmoji,
                    date,
                    note,
                });
                alert("오늘 감정을 기록했어요.");
            }

            // 다시 조회해서 상태 동기화 (AI 결과 포함)
            fetchEmotion(date);
        } catch (err: any) {
            console.error("감정 저장 실패:", err?.response?.data || err);
            alert(err?.response?.data?.message || "감정 저장에 실패했습니다.");
        } finally {
            setSaving(false);
        }
    };

    // 날짜 변경 시마다 조회
    useEffect(() => {
        fetchEmotion(date);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    const today = getTodayString();
    const aiKoreanLabel = getKoreanLabel(currentEmotion?.aiLabel);

    return (
        <div className="space-y-6">
            {/* 상단 타이틀 + 날짜 선택 */}
            <div className="flex items-center justify-between gap-4">
                <PageTitle
                    title="감정 기록"
                    description="하루에 하나의 감정을 이모지로 기록하고, 짧은 메모와 함께 AI 분석 결과도 확인할 수 있어요."
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

            <div className="space-y-6 rounded-xl border border-zinc-200 bg-white p-5">
                {/* 공통 에러 영역 */}
                {error && <ErrorState message={error} />}

                {/* 로딩 상태 */}
                {loading ? (
                    <Spinner />
                ) : (
                    <>
                        {/* 이모지 선택 영역 */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-zinc-800">
                                {date === today ? "오늘의 감정" : "선택한 날짜의 감정"}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {EMOJIS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setSelectedEmoji(emoji)}
                                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-xl transition ${
                                            selectedEmoji === emoji
                                                ? "border-indigo-500 bg-indigo-50"
                                                : "border-zinc-200 bg-white hover:bg-zinc-50"
                                        }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>

                            {currentEmotion ? (
                                <p className="mt-1 text-xs text-zinc-500">
                                    이 날의 감정은 이미 기록되어 있어요. 이모지나 메모를 수정할 수
                                    있어요.
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-zinc-500">
                                    아직 감정이 기록되지 않았어요. 오늘의 기분을 골라보세요.
                                </p>
                            )}
                        </div>

                        {/* 메모 입력 */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-800">
                                짧은 메모 (선택)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                rows={3}
                                placeholder="오늘의 기분이나 이유를 메모로 남겨보세요. 이 텍스트를 기반으로 AI가 감정을 분석해요."
                                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 🔮 AI 감정 분석 결과 영역 */}
                        {currentEmotion && currentEmotion.aiLabel && (
                            <div className="space-y-1 rounded-md bg-indigo-50 px-3 py-3 text-xs">
                                <p className="font-medium text-indigo-800">AI 감정 분석 결과</p>
                                <p className="mt-1 text-indigo-900">
                                    분석된 감정:{" "}
                                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    {aiKoreanLabel ?? currentEmotion.aiLabel}
                  </span>
                                </p>
                                <p className="mt-1 text-indigo-800">
                                    점수 — 긍정 {formatScore(currentEmotion.positive)} · 중립{" "}
                                    {formatScore(currentEmotion.neutral)} · 부정{" "}
                                    {formatScore(currentEmotion.negative)}
                                </p>
                                <p className="mt-1 text-[11px] text-indigo-600">
                                    * 작성한 메모 텍스트를 기반으로 한 자동 분석이에요. 실제 기분과
                                    다를 수도 있어요.
                                </p>
                            </div>
                        )}

                        {/* 저장 버튼 */}
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "저장 중..."
                                    : currentEmotion
                                        ? "감정 수정하기"
                                        : "감정 기록하기"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}