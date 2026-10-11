"use client";

import { useState } from "react";
import { ChoiceGroup } from "./choice-group";
import type { GenerateQuestRequest } from "@/types/quest";

type Energy = NonNullable<GenerateQuestRequest["energy"]>;

const QUICK_PICKS = [
    "I'm bored",
    "I've been doom-scrolling all day",
    "I want to get outside",
    "I want to be more social",
    "I want to study",
    "I don't have much energy today",
];

const TIME_OPTIONS: { label: string; value: number | undefined }[] = [
    { label: "Any", value: undefined },
    { label: "10 min", value: 10 },
    { label: "20 min", value: 20 },
    { label: "30 min", value: 30 },
    { label: "1 hour", value: 60 },
];

const ENERGY_OPTIONS: { label: string; value: Energy | undefined }[] = [
    { label: "Any", value: undefined },
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
];


interface IntentFormProps {
    onSubmit: (req: GenerateQuestRequest) => void;
    busy: boolean;
    error: string | null;
}

export function IntentForm({ onSubmit, busy, error }: IntentFormProps) {
    const [intent, setIntent] = useState("");
    const [time, setTime] = useState<number | undefined>(undefined);
    const [energy, setEnergy] = useState<Energy | undefined>(undefined);

    const canSubmit = intent.trim().length >= 3 && !busy;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({
            intent: intent.trim(),
            timeAvailableMin: time,
            energy,
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <div className="animate-float mb-3 text-5xl" aria-hidden="true">🌱</div>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                    Ready to{" "}
                    <span className="bg-gradient-to-r from-emerald-300 to-lime-300 bg-clip-text text-transparent">
                        touch grass?
                    </span>
                </h1>
                <p className="mt-3 text-white/60">
                    Tell us how you feel and we'll turn it into a small real-world quest.
                </p>
            </div>

            <div>
                <textarea
                    value={intent}
                    onChange={(e) => setIntent(e.target.value)}
                    maxLength={250}
                    rows={3}
                    disabled={busy}
                    placeholder="e.g. I've been doom-scrolling all day..."
                    className="w-full resize-none rounded-xl border border-white/15 bg-white/5 p-4 outline-none placeholder:text-white/30 focus:border-emerald-400 disabled:opacity-50"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                    {QUICK_PICKS.map((pick) => (
                        <button
                            key={pick}
                            type="button"
                            disabled={busy}
                            onClick={() => setIntent(pick)}
                            className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:bg-white/10 disabled:opacity-50"
                        >
                            {pick}
                        </button>
                    ))}
                </div>
            </div>

            <ChoiceGroup
                label="How much time do you have?"
                options={TIME_OPTIONS}
                value={time}
                onChange={setTime}
                disabled={busy}
            />

            <ChoiceGroup
                label="How's your energy?"
                options={ENERGY_OPTIONS}
                value={energy}
                onChange={setEnergy}
                disabled={busy}
            />

            {error && (
                <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </p>
            )}

            <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
                {busy ? "Finding your quest..." : "Give me a quest 🌱"}
            </button>

            {busy && (
                <p className="text-center text-xs text-white/40">
                    The AI is thinking. The first quest can take a little longer.
                </p>
            )}
        </form>
    );
}