import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { xpForLevel } from "@/engines/reward/level";
import { activeStreak } from "@/engines/reward/streak";



export async function GET() {
    const user = await getCurrentUser();

    const stats = await prisma.userStats.upsert({
        where: { userId: user.id },
        update: {},
        create: { userId: user.id },
    });

    const completedCount = await prisma.questAttempt.count({
        where: { userId: user.id, status: "completed" },
    });

    const levelStartXp = xpForLevel(stats.level);
    const nextLevelXp = xpForLevel(stats.level + 1);

    return NextResponse.json({
        totalXp: stats.totalXp,
        level: stats.level,
        coins: stats.coins,
        currentStreak: activeStreak(stats.currentStreak, stats.lastCompletedDate, new Date()),
        longestStreak: stats.longestStreak,
        completedCount,
        xpIntoLevel: stats.totalXp - levelStartXp,
        xpNeededForLevel: nextLevelXp - levelStartXp,
    });
}