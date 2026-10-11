"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { api } from "@/lib/api-client";
import type { Progress } from "@/types/api";

interface ProgressContextValue {
    progress: Progress | null;
    refresh: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const [progress, setProgress] = useState<Progress | null>(null);

    const refresh = useCallback(async () => {
        try {
            setProgress(await api.getProgress());
        } catch {
            // The header is non-critical, so a failure here should not break the app.
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return (
        <ProgressContext.Provider value={{ progress, refresh }}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const ctx = useContext(ProgressContext);
    if (!ctx) throw new Error("useProgress must be used inside ProgressProvider");
    return ctx;
}