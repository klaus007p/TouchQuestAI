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


export function IntroSplash() {
    const [phase, setPhase] = useState<Phase>("show");

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        let seen = false;
        try {
            seen = sessionStorage.getItem(KEY) === "1";
            sessionStorage.setItem(KEY, "1");
        } catch {
            // Storage blocked. Just show the intro.
        }

        if (seen || reduce) {
            setPhase("gone");
            return;
        }

        const t1 = setTimeout(() => setPhase("leaving"), 2600);
        const t2 = setTimeout(() => setPhase("gone"), 3200);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    if (phase === "gone") return null;
    return (
        <div
            onClick={() => setPhase("leaving")}
            aria-hidden="true"
            className={`fixed inset-0 z-[200] overflow-hidden bg-gradient-to-b from-sky-900 via-emerald-950 to-[#070b09] transition-opacity duration-500 ${phase === "leaving" ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
        >
            <div className="absolute left-1/2 top-[12%] h-40 w-40 -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="absolute bottom-0 h-[16%] w-full rounded-t-[50%] bg-emerald-900/80" />

            {TREES.map((t, i) => (
                <span
                    key={i}
                    className="intro-tree absolute bottom-[10%] leading-none"
                    style={{ left: t.left, fontSize: t.size, animationDelay: t.delay }}
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

            <span className="intro-flutter absolute left-[46%] top-[42%] text-3xl">🦋</span>

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
                <span className="intro-hop inline-block -scale-x-100">🐇</span>
            </span>

            <div className="absolute bottom-[10%] left-[27%] h-10 overflow-hidden text-4xl">
                <span className="intro-pop inline-block">🐿️</span>
            </div>

            <div className="intro-title absolute inset-x-0 top-[30%] text-center">
                <div className="text-5xl font-extrabold tracking-tight">🌱 TouchQuest</div>
                <p className="mt-2 text-sm text-white/70">
                    Your AI-powered excuse to touch grass.
                </p>
            </div>
        </div>
    );
}