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
            <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
                <Link href="/" className="text-lg font-bold">
                    🌱 TouchQuest
                </Link>

                <div className="flex items-center gap-4 text-sm">
                    {progress && (
                        <>
                            <span title="Day streak">🔥 {progress.currentStreak}</span>
                            <span title="Coins">🪙 {progress.coins}</span>
                            <div className="w-24">
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
                    <SoundToggle />
                </div>
            </div>
        </header>
    );
}