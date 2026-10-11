import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { toApiQuest } from "@/lib/quest-mapper";

export async function GET() {
    const user = await getCurrentUser();

    const attempts = await prisma.questAttempt.findMany({
        where: { userId: user.id, status: "started" },
        orderBy: { startedAt: "desc" },
        take: 10,
        include: { quest: true },
    });

    return NextResponse.json({
        unfinished: attempts.map((a) => ({
            attemptId: a.id,
            startedAt: a.startedAt,
            quest: toApiQuest(a.quest),
        })),
    });
}