"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Todo {
    id: number;
    content: string;
    isDone: boolean;
    createdAt?: string;
}

export default function TodosPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);

    const [newContent, setNewContent] = useState("");
    const [adding, setAdding] = useState(false);
    const [updatingIds, setUpdatingIds] = useState<number[]>([]);
    const [deletingIds, setDeletingIds] = useState<number[]>([]);

    // ✅ 할 일 목록 조회
    const fetchTodos = async () => {
        setLoading(true);
        try {
            const res = await api.get("/todos");
            const data = res.data;

            let list: Todo[] = [];

            if (Array.isArray(data)) {
                list = data as Todo[];
            } else if (Array.isArray(data?.todos)) {
                list = data.todos as Todo[];
            }

            setTodos(list);
        } catch (error) {
            console.error("할 일 목록 조회 실패:", error);
            alert("할 일 목록을 불러오지 못했어요.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    // ✅ 새 할 일 추가
    const handleAddTodo = async () => {
        if (!newContent.trim()) {
            alert("할 일 내용을 입력해주세요.");
            return;
        }

        setAdding(true);
        try {
            await api.post("/todos", {
                content: newContent.trim(), // 🔥 백엔드 스펙: content 필수
            });

            setNewContent("");
            await fetchTodos();
        } catch (err: any) {
            console.error("할 일 추가 실패:", err?.response?.data || err);

            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "할 일을 추가하지 못했어요.";
            alert(msg);
        } finally {
            setAdding(false);
        }
    };

    // ✅ 완료 여부 토글 (isDone) – 토글 전용 라우트 호출
    const handleToggleComplete = async (todo: Todo) => {
        setUpdatingIds((prev) => [...prev, todo.id]);
        try {
            // 🔥 토글 전용 엔드포인트에 맞춰서 수정
            await api.patch(`/todos/${todo.id}/toggle`);

            // 낙관적 업데이트
            setTodos((prev) =>
                prev.map((t) =>
                    t.id === todo.id ? { ...t, isDone: !t.isDone } : t
                )
            );
        } catch (err: any) {
            console.error("할 일 완료 상태 변경 실패:", err?.response?.data || err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "상태를 변경하지 못했어요.";
            alert(msg);
        } finally {
            setUpdatingIds((prev) => prev.filter((id) => id !== todo.id));
        }
    };

    // ✅ 삭제
    const handleDelete = async (todoId: number) => {
        if (!confirm("이 할 일을 삭제할까요?")) return;

        setDeletingIds((prev) => [...prev, todoId]);
        try {
            await api.delete(`/todos/${todoId}`);
            setTodos((prev) => prev.filter((t) => t.id !== todoId));
        } catch (err: any) {
            console.error("할 일 삭제 실패:", err?.response?.data || err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "할 일을 삭제하지 못했어요.";
            alert(msg);
        } finally {
            setDeletingIds((prev) => prev.filter((id) => id !== todoId));
        }
    };

    // ✅ 간단 통계
    const total = todos.length;
    const completedCount = todos.filter((t) => t.isDone).length;
    const completionRate =
        total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return (
        <div className="space-y-6">
            {/* 페이지 타이틀 + 요약 */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-zinc-900">할 일</h2>
                    <p className="text-sm text-zinc-600">
                        오늘 해야 할 일들을 적어두고, 완료한 일은 체크해 보세요.
                    </p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-right">
                    <p className="text-xs text-zinc-500">오늘의 진행 상황</p>
                    <p className="text-sm font-medium text-zinc-900">
                        {total === 0
                            ? "등록된 할 일이 없어요"
                            : `${total}개 중 ${completedCount}개 완료 (${completionRate}%)`}
                    </p>
                </div>
            </div>

            {/* 새 할 일 입력 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
                <p className="text-sm font-medium text-zinc-800">새 할 일 추가</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                        type="text"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="예: 알고리즘 문제 3개 풀기"
                        className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="button"
                        onClick={handleAddTodo}
                        disabled={adding}
                        className="whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {adding ? "추가 중..." : "할 일 추가"}
                    </button>
                </div>
                <p className="text-xs text-zinc-500">
                    간단한 한 문장으로만 적어도 충분해요. 세부 메모는 나중에 확장해도 돼요.
                </p>
            </div>

            {/* 목록 */}
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <p className="mb-3 text-sm font-medium text-zinc-800">할 일 목록</p>

                {loading ? (
                    <p className="text-sm text-zinc-500">불러오는 중입니다...</p>
                ) : todos.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                        아직 등록된 할 일이 없어요. 위에서 첫 할 일을 만들어 보세요.
                    </p>
                ) : (
                    <ul className="space-y-2">
                        {todos.map((todo) => {
                            const updating = updatingIds.includes(todo.id);
                            const deleting = deletingIds.includes(todo.id);

                            return (
                                <li
                                    key={todo.id}
                                    className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
                                >
                                    <label className="flex flex-1 cursor-pointer items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={todo.isDone}
                                            disabled={updating || deleting}
                                            onChange={() => handleToggleComplete(todo)}
                                            className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div className="space-y-1">
                                            <p
                                                className={`text-sm ${
                                                    todo.isDone
                                                        ? "text-zinc-400 line-through"
                                                        : "text-zinc-900"
                                                }`}
                                            >
                                                {todo.content}
                                            </p>
                                        </div>
                                    </label>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(todo.id)}
                                        disabled={deleting || updating}
                                        className="text-xs text-zinc-400 hover:text-red-500 disabled:cursor-not-allowed"
                                    >
                                        {deleting ? "삭제 중..." : "삭제"}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}