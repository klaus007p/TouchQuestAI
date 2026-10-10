import { getAIProvider } from "@/engines/ai";
import { buildMutatePrompt, SYSTEM_PROMPT } from "@/engines/ai/prompts";
import { calculateRewardXp } from "@/engines/reward/xp";
import type { GeneratedQuest, MutationReason } from "@/types/quest";
import { validateQuest } from "./validator";
import { FALLBACK_QUESTS } from "./fallbacks";
import type { GenerationResult } from "./generate";



const MAX_ATTEMPTS = 3;


function getMaxDuration(original: GeneratedQuest, reason: MutationReason) {
    if (reason === "no_time") return Math.min(10, original.durationMin);
    if (reason === "too_hard") return original.durationMin;
    return undefined;
}


function pickMutationFallback(original: GeneratedQuest, maxDuration?: number) {
    const pool = FALLBACK_QUESTS.filter(
        (q) =>
            q.title !== original.title &&
        (!maxDuration || q.durationMin <= maxDuration)
    );

    const safePool = pool.length > 0 ? pool : FALLBACK_QUESTS;
    return safePool[Math.floor(Math.random() * safePool.length)];
}


// The main function mirrors generateQuest, but sends the original quest to the model


export async function mutateQuest(
    original: GeneratedQuest,
    reason: MutationReason
): Promise<GenerationResult> {
    const ai = getAIProvider();
    const maxDuration = getMaxDuration(original, reason);
    let prompt = buildMutatePrompt(original, reason);

    for(let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const raw = await ai.complete({ system: SYSTEM_PROMPT, prompt });
            const result = validateQuest(raw, { maxDurationMin: maxDuration });

            if(result.ok) {
                const quest = {
                    ...result.quest,
                    rewardXp: calculateRewardXp(result.quest.difficulty, result.quest.durationMin),
                };
                return { quest, source: "ai" };
            }

            console.warn(`[mutateQuest] attempt ${attempt} invalid: ${result.error}`);
            prompt = 
                buildMutatePrompt(original, reason) +
                `\n\n Your previous answer was rejected: ${result.error}. Fix this and reply with valid JSON only.`;

        } catch (e) {
            console.warn(`[mutateQuest] attempt ${attempt} failed:`, (e as Error).message);
        }
    }

    const fallback = pickMutationFallback(original, maxDuration);
    return {
        quest: {
            ...fallback,
            rewardXp: calculateRewardXp(fallback.difficulty, fallback.durationMin),
        },
        source: "fallback",
    };
}