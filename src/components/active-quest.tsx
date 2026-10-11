"use client";

import { useEffect, useState } from "react";
import { sfx } from "@/lib/sound";
import type { ApiQuest, ApiAttempt } from "@/types/api";
import type { Submission } from "@/verification";

function useNow(intervalMs = 1000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
}

function TimerPanel({
    startedAt,
    durationMin,
}: {
    startedAt: string;
    durationMin: number;
}) {
    const now = useNow();
    const totalSec = durationMin * 60;
    const elapsed = Math.max(
        0,
        Math.floor((now - new Date(startedAt).getTime()) / 1000)
    );
    const remaining = Math.max(0, totalSec - elapsed);
    const progress = Math.min(1, elapsed / totalSec);
    const finished = remaining === 0;

    const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
    const ss = String(remaining % 60).padStart(2, "0");
    const C = 2 * Math.PI * 54;

    useEffect(() => {
        if (finished) sfx.success();
    }, [finished]);

    return (
        <div className="space-y-3 py-2">
            <div
                className="text-center text-4xl transition-transform duration-1000"
                style={{ transform: `scale(${0.6 + progress * 0.8})` }}
                aria-hidden="true"
            >
                {progress < 0.34 ? "🌱" : progress < 0.67 ? "🌿" : "🌳"}
            </div>

            <div className="relative mx-auto h-44 w-44">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                    <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" className="stroke-white/10" />
                    <circle
                        cx="60" cy="60" r="54" fill="none" strokeWidth="8" strokeLinecap="round"
                        className="stroke-emerald-400 transition-all duration-1000 ease-linear"
                        strokeDasharray={C}
                        strokeDashoffset={C * (1 - progress)}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tabular-nums">{mm}:{ss}</span>
                    <span className="text-xs text-white/50">
                        {finished ? "Time's up!" : "remaining"}
                    </span>
                </div>
            </div>
        </div>
    );
}


function ChecklistPanel({
    steps,
    checked,
    onToggle,
}: {
    steps: string[];
    checked: boolean[];
    onToggle: (i: number) => void;
}) {
    const done = checked.filter(Boolean).length;

    return (
        <div>
            <div className="mb-3 h-1.5 rounded-full bg-white/10">
                <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{ width: `${(done / steps.length) * 100}%` }}
                />
            </div>
            <ul className="space-y-2">
                {steps.map((step, i) => (
                    <li key={i}>
                        <button
                            type="button"
                            role="checkbox"
                            aria-checked={checked[i]}
                            onClick={() => onToggle(i)}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${checked[i]
                                ? "border-emerald-400/50 bg-emerald-400/10"
                                : "border-white/10 bg-white/[0.03] hover:border-white/25"
                                }`}
                        >
                            <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-sm ${checked[i]
                                    ? "border-emerald-400 bg-emerald-400 text-black"
                                    : "border-white/30"
                                    }`}
                            >
                                {checked[i] ? "✓" : ""}
                            </span>
                            <span className={checked[i] ? "text-white/50 line-through" : "text-white/90"}>
                                {step}
                            </span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}


function StepList({ steps }: { steps: string[] }) {
    return (
        <ol className="space-y-3">
            {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-xs font-bold text-emerald-300">
                        {i + 1}
                    </span>
                    <span className="pt-0.5 text-white/85">{step}</span>
                </li>
            ))}
        </ol>
    );
}


interface ActiveQuestProps {
    quest: ApiQuest;
    attempt: ApiAttempt;
    busy: boolean;
    error: string | null;
    onComplete: (submission: Submission) => void;
    onBack: () => void;
}

export function ActiveQuest({
    quest,
    attempt,
    busy,
    error,
    onComplete,
    onBack,
}: ActiveQuestProps) {
    const type = quest.verificationType;
    const [checked, setChecked] = useState<boolean[]>(() =>
        quest.steps.map(() => false)
    );
    const [text, setText] = useState("");

    useEffect(() => {
        sfx.startAmbient();
        return () => sfx.stopAmbient();
    }, []);

    const checkedCount = checked.filter(Boolean).length;
    const canFinish =
        type === "checklist"
            ? checkedCount === quest.steps.length
            : type === "text"
                ? text.trim().length >= 10
                : true;

    function toggle(i: number) {
        setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    }

    function finish() {
        switch (type) {
            case "checklist":
                return onComplete({ checkedSteps: checkedCount });
            case "text":
                return onComplete({ text: text.trim() });
            default:
                return onComplete({ confirmed: true });
        }
    }

    const finishLabel: Record<string, string> = {
        checklist: "Finish quest ✅",
        timer: "I'm done ✅",
        text: "Submit reflection ✅",
    };

    return (
        <div className="space-y-5">
            <div className="animate-rise rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-emerald-500/5">
                <div className="mb-1 flex items-center gap-2 text-xs text-emerald-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                    Quest in progress
                </div>
                <h2 className="text-2xl font-bold">{quest.title}</h2>
                <p className="mt-1 text-sm text-white/60">{quest.description}</p>

                <div className="mt-6">
                    {type === "checklist" && (
                        <ChecklistPanel steps={quest.steps} checked={checked} onToggle={toggle} />
                    )}

                    {type === "timer" && (
                        <>
                            <TimerPanel startedAt={attempt.startedAt} durationMin={quest.durationMin} />
                            <div className="mt-4">
                                <StepList steps={quest.steps} />
                            </div>
                        </>
                    )}

                    {type === "text" && (
                        <div className="space-y-4">
                            <StepList steps={quest.steps} />
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={1000}
                                rows={4}
                                placeholder="What did you notice or do? (at least a sentence)"
                                className="w-full resize-none rounded-xl border border-white/15 bg-white/5 p-4 outline-none placeholder:text-white/30 focus:border-emerald-400"
                            />
                        </div>
                    )}

                    {(type === "self_report" || type === "photo") && (
                        <div className="space-y-4">
                            <StepList steps={quest.steps} />
                            {type === "photo" && (
                                <p className="text-xs text-white/40">
                                    📷 Photo upload is coming soon. For now, just confirm you did it.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={finish}
                disabled={!canFinish || busy}
                className="w-full rounded-xl bg-emerald-500 py-3.5 text-lg font-bold text-black shadow-lg shadow-emerald-500/20 transition hover:scale-[1.01] hover:bg-emerald-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
                {busy ? "Checking..." : (finishLabel[type] ?? "Yes, I did it! ✅")}
            </button>

            <button
                type="button"
                onClick={onBack}
                disabled={busy}
                className="w-full text-sm text-white/40 transition hover:text-white/70 disabled:opacity-40"
            >
                ← Leave this quest for now
            </button>
        </div>
    );
}