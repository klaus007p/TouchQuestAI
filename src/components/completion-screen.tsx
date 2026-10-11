"use client";

import { useEffect, useRef } from "react";
import { celebrate } from "@/lib/confetti";
import { sfx } from "@/lib/sound";
import { useCountUp } from "@/hooks/use-count-up";
import type { ApiQuest, CompleteResult } from "@/types/api";

interface CompletionScreenProps {
    quest: ApiQuest;
    result: CompleteResult;
    onNewQuest: () => void;
}

export function CompletionScreen({ quest, result, onNewQuest }: CompletionScreenProps) {
    const xp = useCountUp(result.xpAwarded);
    const coins = useCountUp(result.coinsAwarded);
    const fired = useRef(false);

    useEffect(() => {
        if (fired.current) return;
        fired.current = true;
        celebrate(result.leveledUp);
        if (result.leveledUp) sfx.levelUp();
    }, [result.leveledUp]);

    return (
        <div className="space-y-5 text-center">
            <div className="animate-rise rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-emerald-500/10">
                <div className="animate-pop text-6xl" aria-hidden="true">🎉</div>
                <h1 className="mt-3 text-3xl font-extrabold">Quest complete!</h1>
                <p className="mt-1 text-white/60">{quest.title}</p>

                <div className="mt-6 text-6xl font-extrabold tabular-nums text-emerald-300">
                    +{xp} <span className="text-2xl">XP</span>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
                    <span className="rounded-full bg-amber-400/15 px-4 py-1.5 text-amber-200">
                        🪙 +{coins} coins
                    </span>
                    <span className="rounded-full bg-orange-400/15 px-4 py-1.5 text-orange-200">
                        🔥 {result.stats.currentStreak} day streak
                    </span>
                    <span className="rounded-full bg-white/10 px-4 py-1.5 text-white/80">
                        ⭐ Level {result.stats.level}
                    </span>
                </div>

                {result.leveledUp && (
                    <div className="animate-pop mt-6 rounded-xl border border-emerald-400/40 bg-emerald-400/10 py-3 font-bold text-emerald-200 shadow-lg shadow-emerald-500/20">
                        🌟 Level {result.stats.level} unlocked!
                    </div>
                )}

                <figure className="mt-6 rounded-xl bg-white/5 p-4 text-left">
                    <figcaption className="mb-1 text-xs uppercase tracking-wide text-white/40">
                        From your guide
                    </figcaption>
                    <p className="text-white/85">{result.feedback.message}</p>
                </figure>
            </div>

            <button
                type="button"
                onClick={onNewQuest}
                className="w-full rounded-xl bg-emerald-500 py-3.5 text-lg font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:bg-emerald-400 active:scale-[0.99]"
            >
                Start another quest 🌱
            </button>
        </div>
    );
}