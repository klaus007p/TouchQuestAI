"use client";

import Link from "next/link";
import { useProgress } from "./progress-provider";
import { SoundToggle } from "./sound-toggle";

export function Header() {
    const { progress } = useProgress();

    const pct = progress
        ? Math.min(
            100,
            Math.round((progress.xpIntoLevel / progress.xpNeededForLevel) * 100)
        )
        : 0;

    return (
        <header className="border-b border-white/10">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
                <Link href="/" className="shrink-0 text-lg font-bold">
                    🌱 <span className="hidden min-[400px]:inline">TouchQuest</span>
                </Link>

                <div className="flex items-center gap-3 text-sm sm:gap-4">
                    {progress && (
                        <>
                            <span title="Day streak">🔥 {progress.currentStreak}</span>
                            <span title="Coins">🪙 {progress.coins}</span>

                            <span className="sm:hidden" title={`Level ${progress.level}`}>
                                ⭐ {progress.level}
                            </span>

                            <div className="hidden w-24 sm:block">
                                <div className="mb-1 text-xs text-white/60">
                                    Level {progress.level}
                                </div>
                                <div className="h-1.5 rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-emerald-400 transition-all"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <Link
                        href="/progress"
                        aria-label="Progress"
                        className="rounded-full border border-white/15 px-3 py-1 text-xs transition hover:border-white/30"
                    >
                        📈<span className="hidden sm:inline"> Progress</span>
                    </Link>

                    <SoundToggle />
                </div>
            </div>
        </header>
    );
}