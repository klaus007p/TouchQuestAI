import { z } from "zod";


export const QUEST_CATEGORIES = [
    "outdoors",
    "learning",
    "creativity",
    "social",
    "physical",
    "mindfulness",
    "exploration",
    "productivity",
] as const;


export const DIFFICULTIES = ["easy", "medium", "hard"] as const;


export const VERIFICATION_TYPES = [
    "checklist",
    "timer",
    "text",
    "self_report",
    "photo",
] as const;


export const MUTATION_REASONS = [
    "too_hard",
    "too_boring",
    "no_time",
    "already_completed",
    "not_suitable",
    "want_more_challenge",
    "want_something_different",
] as const;


export const GeneratedQuestSchema = z.object({

    title: z.string().min(3).max(80),
    description: z.string().min(10).max(350),
    category: z.enum(QUEST_CATEGORIES),
    difficulty: z.enum(DIFFICULTIES),
    durationMin: z.number().int().min(5).max(120),
    steps: z.array(z.string().min(3).max(150)).min(2).max(7),
    verificationType: z.enum(VERIFICATION_TYPES),
    rewardXp: z.number().int().min(10).max(300),
    
});



export type GeneratedQuest = z.infer<typeof GeneratedQuestSchema>;
export type QuestCategory = (typeof QUEST_CATEGORIES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type VerificationType = (typeof VERIFICATION_TYPES)[number];
export type MutationReason = (typeof MUTATION_REASONS)[number];



export const GenerateQuestRequestSchema = z.object({
    intent: z.string().min(3).max(250),
    timeAvailableMin: z.number().int().min(6).max(240).optional(),
    energy: z.enum([
        "low",
        "medium",
        "high"
    ]).optional(),
});


export const MutateQuestRequestSchema = z.object({
    reason: z.enum(MUTATION_REASONS),
});

export type GenerateQuestRequest = z.infer<typeof GenerateQuestRequestSchema>;
export type MutateQuestRequest = z.infer<typeof MutateQuestRequestSchema>;