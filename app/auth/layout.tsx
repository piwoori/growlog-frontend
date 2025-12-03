// app/auth/layout.tsx
export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
                {/* 로고/서비스명 자리 */}
                <h1 className="mb-2 text-xl font-semibold text-zinc-900">Growlog</h1>
                <p className="mb-6 text-sm text-zinc-500">
                    나의 할 일·감정·회고를 한 곳에서 관리해요.
                </p>

                {children}
            </div>
        </main>
    );
}