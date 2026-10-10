import { getAIProvider } from "@/engines/ai";
import { SYSTEM_PROMPT, buildGeneratePrompt } from "@/engines/ai/prompts";
import { calculateRewardXp } from "@/engines/reward/xp";
import { GenerateQuestRequest, GeneratedQuest } from "@/types/quest";
import { validateQuest } from "./validator";
import { pickFallback } from "./fallbacks";


const MAX_ATTEMPTS = 3;

export interface GenerationResult {
    quest: GeneratedQuest;
    source: "ai" | "fallback";
}


export async function generateQuest(
    req: GenerateQuestRequest
): Promise<GenerationResult> {
    const ai = getAIProvider();
    let prompt = buildGeneratePrompt(req);

    for(let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++){
        try {
            const raw = await ai.complete({ system: SYSTEM_PROMPT, prompt });
            const result = validateQuest(raw, { maxDurationMin: req.timeAvailableMin });

            if (result.ok) {
                const quest = {
                    ...result.quest,
                    rewardXp: calculateRewardXp(result.quest.difficulty, result.quest.durationMin),
                };
                return { quest, source: "ai" };
            }

            console.warn(`[generateQuest] attempt ${attempt} invalid: ${result.error}`);
            prompt = 
                buildGeneratePrompt(req) + 
                `\n\n Your previous answer was rejected: ${result.error}. Fix this and reply with valid JSON only.`;
        } catch (e) {
            console.warn(`[generateQuest] attempt ${attempt} failed:`, (e as Error).message);
        }
    }

    const fallback = pickFallback(req);
    return {
        quest: {
            ...fallback,
            rewardXp: calculateRewardXp(fallback.difficulty, fallback.durationMin),
        },
        source: "fallback",
    };
}