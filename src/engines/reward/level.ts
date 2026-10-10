
export function levelFromXp(totalXp: number): number {
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
} 

// Level 2 is at 100 XP, level 3 at 400, and level 4 at 900.

export function xpForLevel(level: number): number {
    return (level - 1) ** 2 * 100;
}