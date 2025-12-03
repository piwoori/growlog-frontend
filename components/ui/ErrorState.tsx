// components/ui/ErrorState.tsx
interface ErrorStateProps {
    message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
    return (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {message}
        </div>
    );
}