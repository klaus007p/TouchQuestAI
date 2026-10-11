"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { CATEGORY_META } from "@/lib/quest-meta";
import type { Progress, HistoryItem, UnfinishedItem } from "@/types/api";

function Stat({ emoji, label, value }: { emoji: string; label: string; value: number }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
            <div className="text-2xl" aria-hidden="true">{emoji}</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
            <div className="text-xs text-white/50">{label}</div>
        </div>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}


export default function ProgressPage() {
    const [progress, setProgress] = useState<Progress | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [unfinished, setUnfinished] = useState<UnfinishedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        Promise.all([api.getProgress(), api.getHistory(20), api.getUnfinished()])
            .then(([p, h, u]) => {
                setProgress(p);
                setHistory(h.history);
                setUnfinished(u.unfinished);
            })
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-4" aria-label="Loading">
                <div className="shimmer h-32 rounded-2xl bg-white/5" />
                <div className="shimmer h-24 rounded-2xl bg-white/5" />
            </div>
        );
    }

    if (failed || !progress) {
        return <p className="text-red-300">Could not load your progress. Please refresh.</p>;
    }

    const pct = Math.min(
        100,
        Math.round((progress.xpIntoLevel / progress.xpNeededForLevel) * 100)
    );

    return (
        <div className="space-y-8">
            <section className="animate-rise rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex items-end justify-between">
                    <h1 className="text-3xl font-extrabold">Level {progress.level}</h1>
                    <span className="text-sm text-white/60">
                        {progress.xpIntoLevel} / {progress.xpNeededForLevel} XP
                    </span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all"
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-white/40">{progress.totalXp} XP total</p>
            </section>

            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat emoji="🔥" label="Day streak" value={progress.currentStreak} />
                <Stat emoji="🏆" label="Best streak" value={progress.longestStreak} />
                <Stat emoji="🪙" label="Coins" value={progress.coins} />
                <Stat emoji="✅" label="Quests done" value={progress.completedCount} />
            </section>

            {unfinished.length > 0 && (
                <section>
                    <h2 className="mb-3 text-lg font-bold">Pick up where you left off</h2>
                    <ul className="space-y-2">
                        {unfinished.map((u) => (
                            <li
                                key={u.attemptId}
                                className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-4"
                            >
                                <div className="min-w-0">
                                    <div className="truncate font-medium">{u.quest.title}</div>
                                    <div className="text-xs text-white/50">
                                        Started {formatDate(u.startedAt)} · {u.quest.durationMin} min
                                    </div>
                                </div>
                                <Link
                                    href={`/quest/${u.quest.id}`}
                                    className="shrink-0 rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-black hover:bg-emerald-400"
                                >
                                    Resume
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section>
                <h2 className="mb-3 text-lg font-bold">History</h2>
                {history.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-white/50">
                        <div className="text-3xl" aria-hidden="true">🌱</div>
                        <p className="mt-2">No completed quests yet.</p>
                        <Link href="/" className="mt-2 inline-block text-emerald-300 underline">
                            Start your first quest
                        </Link>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {history.map((h) => {
                            const meta = CATEGORY_META[h.quest.category];
                            return (
                                <li
                                    key={h.attemptId}
                                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                                >
                                    <span className="text-2xl" aria-hidden="true">{meta.emoji}</span>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium">{h.quest.title}</div>
                                        <div className="text-xs text-white/50">
                                            {formatDate(h.completedAt)} · {meta.label}
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-sm font-semibold text-emerald-300">
                                        +{h.xp} XP
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
}