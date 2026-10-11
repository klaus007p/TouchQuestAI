"use client";

import { CATEGORY_META, DIFFICULTY_LEVEL } from "@/lib/quest-meta";
import type { ApiQuest } from "@/types/api";
import type { MutationReason } from "@/types/quest";

const PRIMARY_MUTATIONS: { reason: MutationReason; label: string }[] = [
    { reason: "too_hard", label: "😅 Too hard" },
    { reason: "too_boring", label: "😴 Too boring" },
    { reason: "no_time", label: "⏱️ No time" },
];

const SECONDARY_MUTATIONS: { reason: MutationReason; label: string }[] = [
    { reason: "want_more_challenge", label: "🔥 More challenge" },
    { reason: "want_something_different", label: "🔀 Something different" },
];


function DifficultyDots({ level }: { level: number }) {
    return (
        <span className="flex items-center gap-1" title={`Difficulty ${level} of 3`}>
            {[1, 2, 3].map((n) => (
                <span
                    key={n}
                    className={`h-2 w-2 rounded-full ${n <= level ? "bg-emerald-400" : "bg-white/15"
                        }`}
                />
            ))}
        </span>
    );
}


interface QuestCardProps {
    quest: ApiQuest;
    source: "ai" | "fallback" | null;
    busy: boolean;
    error: string | null;
    onMutate: (reason: MutationReason) => void;
    onStart: () => void;
    onReset: () => void;
}

export function QuestCard({
    quest,
    source,
    busy,
    error,
    onMutate,
    onStart,
    onReset,
}: QuestCardProps) {
    const meta = CATEGORY_META[quest.category];

    return (
        <div className="space-y-5">
            <div
                key={quest.id}
                className={`animate-rise rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-emerald-500/5 backdrop-blur transition-opacity ${busy ? "opacity-50" : ""
                    }`}
            >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`rounded-full px-3 py-1 font-medium ${meta.badge}`}>
                        {meta.emoji} {meta.label}
                    </span>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-white/70">
                        ⏱️ {quest.durationMin} min
                    </span>
                    <span className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-white/70">
                        <DifficultyDots level={DIFFICULTY_LEVEL[quest.difficulty]} />
                        <span className="capitalize">{quest.difficulty}</span>
                    </span>
                    <span className="ml-auto rounded-full bg-emerald-400/15 px-3 py-1 font-semibold text-emerald-300">
                        ✨ {quest.rewardXp} XP
                    </span>
                </div>

                <h2 className="mt-5 text-2xl font-bold leading-tight">{quest.title}</h2>
                <p className="mt-2 text-white/65">{quest.description}</p>
                <ol className="mt-6 space-y-3">
                    {quest.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300">
                                {i + 1}
                            </span>
                            <span className="pt-0.5 text-white/85">{step}</span>
                        </li>
                    ))}
                </ol>

                {quest.mutationReason && (
                    <p className="mt-5 text-xs text-white/40">
                        Adapted from your last quest ({quest.mutationReason.replace(/_/g, " ")})
                    </p>
                )}
                {source === "fallback" && (
                    <p className="mt-2 text-xs text-amber-300/70">
                        The AI is unavailable, so this is a classic quest from our library.
                    </p>
                )}
            </div>
            <div>
                <div className="mb-2 text-sm text-white/50">Not feeling it?</div>
                <div className="flex flex-wrap gap-2">
                    {[...PRIMARY_MUTATIONS, ...SECONDARY_MUTATIONS].map((m) => (
                        <button
                            key={m.reason}
                            type="button"
                            disabled={busy}
                            onClick={() => onMutate(m.reason)}
                            className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/75 transition hover:border-emerald-400/50 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {busy && (
                <div className="shimmer h-1 w-full rounded-full" aria-hidden="true" />
            )}

            {error && (
                <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={onStart}
                disabled={busy}
                className="w-full rounded-xl bg-emerald-500 py-3.5 text-lg font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:bg-emerald-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
                Accept quest 🚀
            </button>

            <button
                type="button"
                onClick={onReset}
                disabled={busy}
                className="w-full text-sm text-white/40 transition hover:text-white/70 disabled:opacity-40"
            >
                ← Start over with a new intent
            </button>
        </div>
    );
}