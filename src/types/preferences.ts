import { z } from "zod";
import { DIFFICULTIES, type Difficulty } from "@/types/quest";

export const UpdatePreferencesSchema = z.object({
    interests: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
    difficulty: z.enum(DIFFICULTIES).nullable().optional(),
    goals: z.string().trim().max(300).nullable().optional(),
});

export type UpdatePreferences = z.infer<typeof UpdatePreferencesSchema>;

export interface UserContext {
    interests: string[];
    preferredDifficulty: Difficulty | null;
    goals: string | null;
    habits: string[];
    recentTitles: string[];
}