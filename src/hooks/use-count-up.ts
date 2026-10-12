
"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, durationMs = 1200) {
    const [value, setValue] = useState(0);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        const updatePreference = () => {
            setReduceMotion(mediaQuery.matches);
        };

        updatePreference();
        mediaQuery.addEventListener("change", updatePreference);

        return () => {
            mediaQuery.removeEventListener("change", updatePreference);
        };
    }, []);

    useEffect(() => {
        if (reduceMotion) return;

        let raf = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);

            setValue(Math.round(target * eased));

            if (t < 1) {
                raf = requestAnimationFrame(tick);
            }
        };

        raf = requestAnimationFrame(tick);

        return () => cancelAnimationFrame(raf);
    }, [target, durationMs, reduceMotion]);

    return reduceMotion ? target : value;
}
