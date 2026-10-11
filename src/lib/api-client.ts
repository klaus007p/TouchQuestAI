
import type {
    GenerateQuestRequest,
    MutationReason,
} from "@/types/quest";
import type { Submission } from "@/verification";
import type { UpdatePreferences } from "@/types/preferences";
import type {
    ApiQuest,
    ApiAttempt,
    Progress,
    CompleteResult,
    HistoryItem,
    UnfinishedItem,
} from "@/types/api";

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

let guestReady: Promise<void> | null = null;

function ensureGuest(): Promise<void> {
    if (!guestReady) {
        guestReady = fetch("/api/v1/me")
            .then(() => undefined)
            .catch(() => {
                guestReady = null;
            });
    }
    return guestReady;
}

async function request<T>(
    path: string,
    init?: { method?: string; body?: unknown }
): Promise<T> {
    await ensureGuest();

    const res = await fetch(`/api/v1${path}`, {
        method: init?.method ?? "GET",
        headers: { "Content-Type": "application/json" },
        body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiError(data?.error ?? "Something went wrong", res.status);
    }

    return data as T;
}

type QuestSource = "ai" | "fallback";

export const api = {
    generateQuest: (body: GenerateQuestRequest) =>
        request<{ source: QuestSource; quest: ApiQuest }>("/quests/generate", {
            method: "POST",
            body,
        }),

    mutateQuest: (id: string, reason: MutationReason) =>
        request<{ source: QuestSource; quest: ApiQuest }>(
            `/quests/${id}/mutate`,
            {
                method: "POST",
                body: { reason },
            }
        ),

    startQuest: (id: string) =>
        request<{ attempt: ApiAttempt; resumed: boolean }>(
            `/quests/${id}/start`,
            {
                method: "POST",
            }
        ),

    completeQuest: (id: string, submission?: Submission) =>
        request<CompleteResult>(`/quests/${id}/complete`, {
            method: "POST",
            body: { submission },
        }),

    getQuest: (id: string) =>
        request<{ quest: ApiQuest; attempt: ApiAttempt | null }>(
            `/quests/${id}`
        ),

    getProgress: () => request<Progress>("/progress/me"),

    getHistory: (limit = 20) =>
        request<{ history: HistoryItem[] }>(
            `/progress/history?limit=${limit}`
        ),

    getUnfinished: () =>
        request<{ unfinished: UnfinishedItem[] }>("/progress/unfinished"),

    getPreferences: () =>
        request<{
            preferences: {
                interests: string[];
                difficulty: string | null;
                goals: string | null;
            };
        }>("/preferences"),

    updatePreferences: (body: UpdatePreferences) =>
        request<{ preferences: unknown }>("/preferences", {
            method: "PATCH",
            body,
        }),
};
