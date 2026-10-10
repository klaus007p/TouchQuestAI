import type { Difficulty } from "@/types/quest";


const BASE_XP: Record<Difficulty, number> = {
    easy: 30,
    medium: 60,
    hard: 100,
};


export function calculateRewardXp(difficulty: Difficulty, durationMin: number): number {
    return BASE_XP[difficulty] + Math.round(durationMin * 1.5);
}

export function calculateCoins(xp: number): number {
    return Math.round(xp / 10);
}