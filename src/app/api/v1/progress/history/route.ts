import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { toApiQuest } from "@/lib/quest-mapper";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const raw = Number(searchParams.get("limit"));
    const limit = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 50) : 20;

    const user = await getCurrentUser();

    const attempts = await prisma.questAttempt.findMany({
        where: { userId: user.id, status: "completed" },
        orderBy: { completedAt: "desc" },
        take: limit,
        include: { quest: true, xpEvent: true },
    });

    return NextResponse.json({
        history: attempts.map((a) => ({
            attemptId: a.id,
            completedAt: a.completedAt,
            xp: a.xpEvent?.xp ?? 0,
            coins: a.xpEvent?.coins ?? 0,
            quest: toApiQuest(a.quest),
        })),
    });
}