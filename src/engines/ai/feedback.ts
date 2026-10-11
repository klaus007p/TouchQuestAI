import { z } from "zod";
import { getAIProvider } from "./index";
import {
    FEEDBACK_SYSTEM_PROMPT,
    buildFeedbackPrompt,
    type FeedbackInput,
} from "./prompts";
import { extractJson } from "@/engines/quest/validator";



const FeedbackSchema = z.object({
    message: z.string().trim().min(5).max(200),
});



const GENERIC_MESSAGES = [
    "Nice work. You chose the real world over the screen!",
    "Quest complete. Small steps add up.",
    "Well done. That was time well spent.",
    "You showed up for yourself today. Keep going!",
];



export function fallbackFeedback(i: FeedbackInput): string {
    if (i.leveledUp) return `Level ${i.level} unlocked! You earned it.`;
    if (i.streak >= 3) return `${i.streak}-day streak! Keep it going.`;
    return GENERIC_MESSAGES[Math.floor(Math.random() * GENERIC_MESSAGES.length)];
}



export interface FeedbackResult {
    message: string;
    source: "ai" | "fallback";
}



export async function generateFeedback(
    input: FeedbackInput
): Promise<FeedbackResult> {
    try {
        const raw = await getAIProvider().complete({
            system: FEEDBACK_SYSTEM_PROMPT,
            prompt: buildFeedbackPrompt(input),
            timeoutMs: 8_000,
        });

        const parsed = FeedbackSchema.safeParse(extractJson(raw));
        if (parsed.success) {
            return { message: parsed.data.message, source: "ai" };
        }
        console.warn("[generateFeedback] invalid response:", parsed.error.message);
    } catch (e) {
        console.warn("[generateFeedback] failed:", (e as Error).message);
    }

    return { message: fallbackFeedback(input), source: "fallback" };
}

