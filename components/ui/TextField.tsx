// components/ui/TextField.tsx
import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    helperText?: string;
}

export function TextField({
                              label,
                              error,
                              helperText,
                              className,
                              ...props
                          }: TextFieldProps) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-800">{label}</label>
            <input
                {...props}
                className={clsx(
                    "w-full rounded-md border px-3 py-2 text-sm outline-none",
                    error
                        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                        : "border-zinc-200 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900",
                    className
                )}
            />
            {helperText && !error && (
                <p className="text-xs text-zinc-400">{helperText}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}