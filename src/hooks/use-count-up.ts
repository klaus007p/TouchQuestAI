"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, durationMs = 1200) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) {
            setValue(target);
            return;
        }

        let raf = 0;
        const start = performance.now();

        const tick = (now: number) => {
            const t = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(target * eased));
            if (t < 1) raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, durationMs]);

    return value;
}