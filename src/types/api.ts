import type {
    QuestCategory,
    Difficulty,
    VerificationType,
    MutationReason,
} from "@/types/quest";

export interface ApiQuest {
    id: string;
    title: string;
    description: string;
    category: QuestCategory;
    difficulty: Difficulty;
    durationMin: number;
    steps: string[];
    verificationType: VerificationType;
    rewardXp: number;
    userIntent: string | null;
    parentQuestId: string | null;
    mutationReason: MutationReason | null;
    createdAt: string;
}

export interface ApiAttempt {
    id: string;
    status: string;
    startedAt: string;
}

export interface Progress {
    totalXp: number;
    level: number;
    coins: number;
    currentStreak: number;
    longestStreak: number;
    completedCount: number;
    xpIntoLevel: number;
    xpNeededForLevel: number;
}

export interface CompleteResult {
    xpAwarded: number;
    coinsAwarded: number;
    leveledUp: boolean;
    stats: {
        totalXp: number;
        level: number;
        coins: number;
        currentStreak: number;
        longestStreak: number;
    };
    feedback: { message: string; source: "ai" | "fallback" };
}

export interface HistoryItem {
    attemptId: string;
    completedAt: string;
    xp: number;
    coins: number;
    quest: ApiQuest;
}