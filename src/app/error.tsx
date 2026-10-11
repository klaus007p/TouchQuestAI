"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="animate-rise space-y-4 py-16 text-center">
            <div className="text-5xl" aria-hidden="true">🥀</div>
            <h1 className="text-2xl font-bold">Something wilted</h1>
            <p className="text-white/60">
                An unexpected error happened. Your progress is safe.
            </p>
            <button
                type="button"
                onClick={reset}
                className="rounded-xl bg-emerald-500 px-6 py-2.5 font-semibold text-black hover:bg-emerald-400"
            >
                Try again
            </button>
        </div>
    );
}