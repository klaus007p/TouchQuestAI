
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { api, ApiError } from "@/lib/api-client";
import { useProgress } from "@/components/progress-provider";
import { ActiveQuest } from "@/components/active-quest";
import { CompletionScreen } from "@/components/completion-screen";

import type { Submission } from "@/verification";
import type { ApiQuest, ApiAttempt, CompleteResult } from "@/types/api";

function QuestContent() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { refresh } = useProgress();

    const [quest, setQuest] = useState<ApiQuest | null>(null);
    const [attempt, setAttempt] = useState<ApiAttempt | null>(null);
    const [result, setResult] = useState<CompleteResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        api
            .getQuest(id)
            .then((res) => {
                if (cancelled) return;

                setQuest(res.quest);
                setAttempt(res.attempt);
            })
            .catch((e) => {
                if (cancelled) return;

                setError(
                    e instanceof ApiError
                        ? e.message
                        : "Could not load this quest."
                );
            })
            .finally(() => {
                if (!cancelled) {
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [id]);

    async function complete(submission: Submission) {
        setBusy(true);
        setError(null);

        try {
            setResult(await api.completeQuest(id, submission));
            await refresh();
        } catch (e) {
            setError(
                e instanceof ApiError
                    ? e.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setBusy(false);
        }
    }

    if (loading) {
        return (
            <div
                className="shimmer h-48 rounded-2xl bg-white/5"
                aria-label="Loading"
            />
        );
    }

    if (!quest) {
        return (
            <div className="space-y-4 text-center">
                <p className="text-red-300">
                    {error ?? "Quest not found."}
                </p>

                <Link href="/" className="text-emerald-300 underline">
                    Back home
                </Link>
            </div>
        );
    }

    if (result) {
        return (
            <CompletionScreen
                quest={quest}
                result={result}
                onNewQuest={() => router.push("/")}
            />
        );
    }

    if (attempt?.status === "started") {
        return (
            <ActiveQuest
                quest={quest}
                attempt={attempt}
                busy={busy}
                error={error}
                onComplete={complete}
                onBack={() => router.push("/progress")}
            />
        );
    }

    return (
        <div className="space-y-4 text-center">
            <p className="text-white/70">
                {attempt
                    ? "You already completed this quest."
                    : "This quest hasn't been started yet."}
            </p>

            <Link href="/" className="text-emerald-300 underline">
                Get a new quest
            </Link>
        </div>
    );
}

export default function QuestPage() {
    return (
        <Suspense
            fallback={
                <div
                    className="shimmer h-48 rounded-2xl bg-white/5"
                    aria-label="Loading quest"
                />
            }
        >
            <QuestContent />
        </Suspense>
    );
}


