// app/dashboard/page.tsx

export default function DashboardHome() {
    return (
        <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-zinc-900">오늘 요약</h2>
            <p className="text-sm text-zinc-600">
                오늘의 감정, 회고, 할 일 진행 상황을 한눈에 볼 수 있는 대시보드입니다.
                (이 칸에는 나중에 /daily API로 불러온 요약 카드들이 들어올 예정이에요.)
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-zinc-800">오늘 할 일</h3>
                    <p className="mt-2 text-xs text-zinc-500">
                        /dashboard/todos 에서 할 일을 추가하면 여기에서 진행률을 보여줄 거예요.
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-zinc-800">오늘 감정</h3>
                    <p className="mt-2 text-xs text-zinc-500">
                        /dashboard/emotions 에서 기록한 오늘의 감정을 요약해서 보여줄 예정이에요.
                    </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <h3 className="text-sm font-semibold text-zinc-800">오늘 회고</h3>
                    <p className="mt-2 text-xs text-zinc-500">
                        /dashboard/reflections 에서 작성한 회고를 요약해서 보여줄 예정이에요.
                    </p>
                </div>
            </div>
        </section>
    );
}