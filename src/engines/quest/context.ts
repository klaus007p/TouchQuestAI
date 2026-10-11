import { prisma } from "@/lib/prisma";
import type { Difficulty, MutationReason } from "@/types/quest";
import type { UserContext } from "@/types/preferences";

const HABIT_HINTS: Partial<Record<MutationReason, string>> = {
    too_hard: "This user often finds quests too hard. Keep them gentle and simple.",
    too_boring: "This user often finds quests boring. Add novelty and a playful twist.",
    no_time: "This user often lacks time. Prefer short quests.",
    want_more_challenge: "This user likes a challenge. Add a small stretch.",
};

const HABIT_THRESHOLD = 2;

function parseList(value: string | null): string[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}


export async function buildUserContext(userId: string): Promise<UserContext> {
    const [pref, mutated, recent] = await Promise.all([
        prisma.userPreference.findUnique({ where: { userId } }),
        prisma.quest.findMany({
            where: { createdById: userId, mutationReason: { not: null } },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { mutationReason: true },
        }),
        prisma.quest.findMany({
            where: { createdById: userId },
            orderBy: { createdAt: "desc" },
            take: 10,
            select: { title: true },
        }),
    ]);

    const counts: Record<string, number> = {};
    for (const m of mutated) {
        if (m.mutationReason) {
            counts[m.mutationReason] = (counts[m.mutationReason] ?? 0) + 1;
        }
    }

    const habits = Object.entries(HABIT_HINTS)
        .filter(([reason]) => (counts[reason] ?? 0) >= HABIT_THRESHOLD)
        .map(([, hint]) => hint as string);

    return {
        interests: parseList(pref?.interests ?? null),
        preferredDifficulty: (pref?.difficulty as Difficulty | null) ?? null,
        goals: pref?.goals ?? null,
        habits,
        recentTitles: [...new Set(recent.map((q) => q.title))].slice(0, 5),
    };
}