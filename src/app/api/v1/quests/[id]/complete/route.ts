import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { parseSteps } from "@/lib/quest-mapper";
import { verifyCompletion, CompleteQuestRequestSchema } from "@/verification";
import {
    completeAttempt,
    AttemptAlreadyCompletedError,
} from "@/engines/reward/complete";
import type { VerificationType } from "@/types/quest";
import { error } from "console";
import { get } from "http";
import { use } from "react";



export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const body = await request.json().catch(() => ({}));
    const parsed = CompleteQuestRequestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", details: parsed.error.flatten() },
            { status: 400 },
        );
    }

    const submission = parsed.data.submission ?? {};

    const user = await getCurrentUser();

    const quest = await prisma.quest.findUnique({ where: { id } });
    if (!quest || quest.createdById !== user.id) {
        return NextResponse.json({ error: "Quest not found" }, { status: 404 });
    }

    const attempt = await prisma.questAttempt.findFirst({
        where: { userId: user.id, questId: id, status: "started" },
        orderBy: { startedAt: "desc" },
    });

    if (!attempt) {
        return NextResponse.json(
            { error: "Start the quest before completing it" },
            { status: 409 }
        );
    }

    const verification = verifyCompletion({
        type: quest.verificationType as VerificationType,
        submission,
        totalSteps: parseSteps(quest.steps).length,
        durationMin: quest.durationMin,
        startedAt: attempt.startedAt,
        now: new Date(),
    });

    if (!verification.ok) {
        return NextResponse.json({ error: verification.error }, { status: 422 });
    }

    try {
        const result = await completeAttempt({
            attemptId: attempt.id,
            userId: user.id,
            questId: quest.id,
            rewardXp: quest.rewardXp,
            verificationData: submission,
        });
        return NextResponse.json(result);

    } catch (e) {
        if(e instanceof AttemptAlreadyCompletedError) {
            return NextResponse.json({ error: "Already completed " }, { status: 409 });
        }    
        throw e;
    }
}