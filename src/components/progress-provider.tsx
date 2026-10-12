
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
            const result = await api.getProgress();
            setProgress(result);
        } catch {
            // The header is non-critical, so a failure here should not break the app.
        }
    }, []);

    useEffect(() => {
        let active = true;

        const loadProgress = async () => {
            try {
                const result = await api.getProgress();

                if (active) {
                    setProgress(result);
                }
            } catch {
                // The header is non-critical, so a failure here should not break the app.
            }
        };

        void loadProgress();

        return () => {
            active = false;
        };
    }, []);

    return (
        <ProgressContext.Provider value={{ progress, refresh }}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const ctx = useContext(ProgressContext);

    if (!ctx) {
        throw new Error("useProgress must be used inside ProgressProvider");
    }

    return ctx;
}
