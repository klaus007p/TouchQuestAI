import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { toApiQuest } from "@/lib/quest-mapper";



export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = await getCurrentUser();

    const quest = await prisma.quest.findUnique({ where: { id } });
    if (!quest || quest.createdById !== user.id) {
        return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    const attempt = await prisma.questAttempt.findFirst({
        where: { userId: user.id, questId: id },
        orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({
        quest: toApiQuest(quest),
        attempt: attempt
        ? { id: attempt.id, status: attempt.status, startedAt: attempt.startedAt }
        : null,
    });
}

