"use client";

import { useEffect, useState } from "react";

const KEY = "tq_intro_seen";

const TREES = [
    { emoji: "🌲", left: "3%", size: "6rem", delay: "0.1s" },
    { emoji: "🌳", left: "17%", size: "5rem", delay: "0.3s" },
    { emoji: "🌲", left: "33%", size: "4rem", delay: "0.5s" },
    { emoji: "🌳", left: "60%", size: "4.5rem", delay: "0.4s" },
    { emoji: "🌲", left: "76%", size: "5.5rem", delay: "0.2s" },
    { emoji: "🌳", left: "89%", size: "6rem", delay: "0.6s" },
];

type Phase = "show" | "leaving" | "gone";

function markSeen() {
    try {
        sessionStorage.setItem(KEY, "1");
    } catch {
        // Storage blocked. The intro may show again, which is harmless.
    }
}

function shouldShowIntro(): boolean {
    if (typeof window === "undefined") return false;

    try {
        if (sessionStorage.getItem(KEY) === "1") return false;
    } catch {
        // Storage blocked. Continue with the normal intro.
    }

    return !window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;
}

export function IntroSplash() {
    // Start "gone" so the server HTML and the first client render match.
    const [phase, setPhase] = useState<Phase>("gone");

    // Decide after mount (client only).
    useEffect(() => {
        if (!shouldShowIntro()) return;
        const t = window.setTimeout(() => setPhase("show"), 0);
        return () => window.clearTimeout(t);
    }, []);

    // Auto-start leaving after the intro plays.
    useEffect(() => {
        if (phase !== "show") return;

        const t = window.setTimeout(() => setPhase("leaving"), 2600);
        return () => window.clearTimeout(t);
    }, [phase]);

    // Remove the splash after the fade-out finishes.
    useEffect(() => {
        if (phase !== "leaving") return;

        markSeen();
        const t = window.setTimeout(() => setPhase("gone"), 600);
        return () => window.clearTimeout(t);
    }, [phase]);

    if (phase === "gone") return null;

    return (
        <div
            onClick={() => setPhase("leaving")}
            aria-hidden="true"
            className={`fixed inset-0 z-[200] overflow-hidden bg-gradient-to-b from-sky-900 via-emerald-950 to-[#070b09] transition-opacity duration-500 ${phase === "leaving"
                    ? "pointer-events-none opacity-0"
                    : "opacity-100"
                }`}
        >
            <div className="absolute left-1/2 top-[12%] h-40 w-40 -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl" />

            <div className="absolute bottom-0 h-[16%] w-full rounded-t-[50%] bg-emerald-900/80" />

            {TREES.map((t, i) => (
                <span
                    key={i}
                    className="intro-tree absolute bottom-[10%] leading-none"
                    style={{
                        left: t.left,
                        fontSize: t.size,
                        animationDelay: t.delay,
                    }}
                >
                    {t.emoji}
                </span>
            ))}

            <span
                className="intro-fly absolute top-[18%] text-4xl"
                style={{ animationDelay: "0.4s" }}
            >
                <span className="intro-bob inline-block">🐦</span>
            </span>

            <span className="intro-flutter absolute left-[46%] top-[42%] text-3xl">
                🦋
            </span>

            <span
                className="intro-walk absolute bottom-[10%] text-5xl"
                style={{ animationDelay: "0.3s" }}
            >
                <span className="inline-block -scale-x-100">🦌</span>
            </span>

            <span
                className="intro-walk-fast absolute bottom-[9%] text-3xl"
                style={{ animationDelay: "1s" }}
            >
                <span className="intro-hop inline-block -scale-x-100">
                    🐇
                </span>
            </span>

            <div className="absolute bottom-[10%] left-[27%] h-10 overflow-hidden text-4xl">
                <span className="intro-pop inline-block">🐿️</span>
            </div>

            <div className="intro-title absolute inset-x-0 top-[30%] text-center">
                <div className="text-5xl font-extrabold tracking-tight">
                    🌱 TouchQuest
                </div>

                <p className="mt-2 text-sm text-white/70">
                    Your AI-powered excuse to touch grass.
                </p>
            </div>
        </div>
    );
}
