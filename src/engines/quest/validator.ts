
import { GeneratedQuestSchema, type GeneratedQuest } from "@/types/quest";


export type ValidationResult =
    | { ok: true, quest: GeneratedQuest }
    | { ok: false, error: string };


function extractJson(raw: string): unknown {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("No JSON object found in response");
    }

    return JSON.parse(raw.slice(start, end + 1));
}

// Safety check against all quest text

const UNSAFE_PATTERNS: { pattern: RegExp; reason: string }[] = [
    { pattern: /stranger/i, reason: "mentions strangers" },
    { pattern: /trespass|private property/i, reason: "mentions restricted places" },
    { pattern: /at night|after dark|midnight/i, reason: "mentions night activity" },
    { pattern: /\b(buy|purchase|spend money)\b/i, reason: "requires spending money" },
    { pattern: /\b(swim|climb|cliff|highway|traffic)\b/i, reason: "risky activity" },
    { pattern: /\b(alcohol|drunk|drugs)\b/i, reason: "unsafe substances" },
];



export function validateQuest(
    raw: string,
    options: { maxDurationMin?: number } = {}
): ValidationResult {
    let json: unknown;

    try {
        json = extractJson(raw);
    } catch (e) {
        return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
    }

    const parsed = GeneratedQuestSchema.safeParse(json);
    if (!parsed.success) {
        const issues = parsed.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; ");
        return { ok: false, error: `Schema errors: ${issues}` };
    }

    const quest = parsed.data;

    const text = [quest.title, quest.description, ...quest.steps].join(" ");
    for (const { pattern, reason } of UNSAFE_PATTERNS) {
        if (pattern.test(text)) {
            return { ok: false, error: `Unsafe content: ${reason}` };
        }
    }

    if (options.maxDurationMin && quest.durationMin > options.maxDurationMin) {
        return {
            ok: false,
            error: `durationMin ${quest.durationMin} exceeds the user's ${options.maxDurationMin} minutes`,
        };
    }

    return { ok: true, quest };
}