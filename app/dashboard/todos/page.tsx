"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Todo {
    id: number;
    content: string;
    isDone: boolean;
    createdAt: string;
}

export default function TodosPage() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState("");

    // GET /todos - 목록 조회
    const fetchTodos = async () => {
        try {
            const res = await api.get("/todos");
            setTodos(res.data);
        } catch (err) {
            console.error("Failed to fetch todos", err);
        }
    };

    // POST /todos - 새 할 일 추가  ⭐ content 로 보내기!
    const addTodo = async () => {
        if (!newTodo.trim()) return;

        try {
            await api.post("/todos", { content: newTodo });
            setNewTodo("");
            fetchTodos();
        } catch (err) {
            console.error("Failed to add todo", err);
        }
    };

    // PATCH /todos/:id/toggle - 완료 상태 토글
    const toggleDone = async (id: number) => {
        try {
            await api.patch(`/todos/${id}/toggle`);
            fetchTodos();
        } catch (err) {
            console.error("Failed to toggle todo", err);
        }
    };

    // DELETE /todos/:id - 삭제
    const deleteTodo = async (id: number) => {
        try {
            await api.delete(`/todos/${id}`);
            fetchTodos();
        } catch (err) {
            console.error("Failed to delete todo", err);
        }
    };

    // 초기 로드
    useEffect(() => {
        fetchTodos();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            addTodo();
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-zinc-900">할 일 관리</h2>

            {/* 입력창 */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="새 할 일 입력..."
                    className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                    onClick={addTodo}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
                >
                    추가
                </button>
            </div>

            {/* 목록 */}
            <div className="space-y-3">
                {todos.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                        할 일이 없습니다. 새로 추가해보세요!
                    </p>
                ) : (
                    todos.map((todo) => (
                        <div
                            key={todo.id}
                            className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={todo.isDone}
                                    onChange={() => toggleDone(todo.id)}
                                    className="h-4 w-4 cursor-pointer"
                                />
                                <span
                                    className={`text-sm ${
                                        todo.isDone ? "line-through text-zinc-400" : "text-zinc-800"
                                    }`}
                                >
                  {todo.content}
                </span>
                            </div>

                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="text-xs text-red-500 hover:underline"
                            >
                                삭제
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}