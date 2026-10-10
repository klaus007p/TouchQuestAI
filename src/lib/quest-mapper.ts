import type { Quest } from "@prisma/client";
import type {
    GeneratedQuest,
    QuestCategory,
    Difficulty,
    VerificationType,
} from "@/types/quest";


export function parseSteps(steps: string): string[] {
    try {
        const parsed = JSON.parse(steps);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}


export function toApiQuest(quest: Quest) {
    return { ...quest, steps: parseSteps(quest.steps) };
}


export function toGeneratedQuest(quest: Quest): GeneratedQuest {
    return {
        title: quest.title,
        description: quest.description,
        category: quest.category as QuestCategory,
        difficulty: quest.difficulty as Difficulty,
        durationMin: quest.durationMin,
        steps: parseSteps(quest.steps),
        verificationType: quest.verificationType as VerificationType,
        rewardXp: quest.rewardXp,
    };
}