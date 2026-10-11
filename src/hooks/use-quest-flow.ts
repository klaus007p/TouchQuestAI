"use client";

import { useCallback, useState } from "react";
import { api, ApiError } from "@/lib/api-client";
import { useProgress } from "@/components/progress-provider";
import type { GenerateQuestRequest, MutationReason } from "@/types/quest";
import type { Submission } from "@/verification";
import type { ApiQuest, ApiAttempt, CompleteResult } from "@/types/api";
import { sfx } from "@/lib/sound";

export type Phase = "idle" | "ready" | "active" | "done";

export function useQuestFlow() {
    const { refresh } = useProgress();

    const [phase, setPhase] = useState<Phase>("idle");
    const [quest, setQuest] = useState<ApiQuest | null>(null);
    const [attempt, setAttempt] = useState<ApiAttempt | null>(null);
    const [result, setResult] = useState<CompleteResult | null>(null);
    const [source, setSource] = useState<"ai" | "fallback" | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const run = useCallback(async (action: () => Promise<void>) => {
        setBusy(true);
        setError(null);
        try {
            await action();
        } catch (e) {
            setError(
                e instanceof ApiError ? e.message : "Something went wrong. Please try again."
            );
        } finally {
            setBusy(false);
        }
    }, []);
    const generate = (req: GenerateQuestRequest) =>
        run(async () => {
            const res = await api.generateQuest(req);
            setQuest(res.quest);
            setSource(res.source);
            setAttempt(null);
            setResult(null);
            setPhase("ready");
            sfx.chirp();
        });

    const mutate = (reason: MutationReason) =>
        run(async () => {
            if (!quest) return;
            const res = await api.mutateQuest(quest.id, reason);
            setQuest(res.quest);
            setSource(res.source);
            sfx.chirp();
        });

    const start = () =>
        run(async () => {
            if (!quest) return;
            const res = await api.startQuest(quest.id);
            setAttempt(res.attempt);
            setPhase("active");
            sfx.start();
        });

    const complete = (submission: Submission) =>
        run(async () => {
            if (!quest) return;
            const res = await api.completeQuest(quest.id, submission);
            setResult(res);
            setPhase("done");
            sfx.success();
            await refresh();
        });

    const reset = () => {
        setPhase("idle");
        setQuest(null);
        setAttempt(null);
        setResult(null);
        setSource(null);
        setError(null);
    };

    return {
        phase, quest, attempt, result, source, busy, error,
        generate, mutate, start, complete, reset,
    };
}