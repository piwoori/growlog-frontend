import Link from "next/link";

export default function Home() {
  return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-sm">
          {/* 상단 텍스트 */}
          <div className="mb-10 space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              GROWLOG
            </p>
            <h1 className="text-3xl font-semibold leading-snug text-zinc-900">
              감정 · 회고 · 할 일을 한 곳에서 관리하는
              <br />
              <span className="text-indigo-600">자기관리 로그북</span>
            </h1>
            <p className="text-sm text-zinc-600">
              오늘의 기분을 기록하고, 하루를 돌아보고, 할 일을 정리하세요.
              Growlog가 꾸준한 성장 루틴을 도와줍니다.
            </p>
          </div>

          {/* 버튼 영역 */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
                href="/auth/login"
                className="flex-1 rounded-full bg-zinc-900 px-4 py-3 text-center text-sm font-medium text-zinc-50 hover:bg-zinc-800"
            >
              로그인하기
            </Link>
            <Link
                href="/auth/register"
                className="flex-1 rounded-full border border-zinc-200 px-4 py-3 text-center text-sm font-medium text-zinc-800 hover:bg-zinc-100"
            >
              처음이에요 · 회원가입
            </Link>
          </div>

          {/* 하단 설명 */}
          <div className="mt-10 grid gap-4 text-xs text-zinc-500 sm:grid-cols-3">
            <div className="space-y-1">
              <p className="font-semibold text-zinc-800">감정 기록</p>
              <p>이모지와 한 줄 메모로 오늘의 기분을 남겨요.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-zinc-800">회고</p>
              <p>하루를 돌아보며 잘한 점과 아쉬운 점을 정리해요.</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-zinc-800">할 일 & 통계</p>
              <p>달성률과 감정 패턴을 한 눈에 확인해요.</p>
            </div>
          </div>
        </div>
      </main>
  );
}
