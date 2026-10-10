import { prisma } from "@/lib/prisma";
import { calculateCoins } from "./xp";
import { levelFromXp } from "./level";
import { nextStreak } from "./streak";


export class AttemptAlreadyCompletedError extends Error {}

interface CompleteParams {
    attemptId: string;
    userId: string;
    questId: string;
    rewardXp: number;
    verificationData: unknown;
}


export async function completeAttempt(params: CompleteParams) {
    const { attemptId, userId, questId, rewardXp, verificationData } = params;
    const coins = calculateCoins(rewardXp);
    const now = new Date();

    return prisma.$transaction(async (tx) => {
        const claimed = await tx.questAttempt.updateMany({
            where: { id: attemptId, userId, status: "started" },
            data: {
                status: "completed",
                completedAt: now,
                verificationData: JSON.stringify(verificationData),
            },
        });

        if (claimed.count === 0) {
            throw new AttemptAlreadyCompletedError("Attempt already completed ");
        }

        await tx.xpEvent.create({
            data: { userId, questId, attemptId, xp: rewardXp, coins },
        });

        const stats = await tx.userStats.upsert({
            where: { userId },
            update: {},
            create: { userId },
        });

        const totalXp = stats.totalXp + rewardXp;
        const currentStreak = nextStreak(stats.currentStreak, stats.lastCompletedDate, now);

        const updated = await tx.userStats.update({
            where: { userId },
            data: {
                totalXp,
                coins: stats.coins + coins,
                level: levelFromXp(totalXp),
                currentStreak,
                longestStreak: Math.max(stats.longestStreak, currentStreak),
                lastCompletedDate: now
            },
        });

        return {
            xpAwarded: rewardXp,
            coinsAwarded: coins,
            leveledUp: updated.level > stats.level,
            stats: updated,
        };
    });
}