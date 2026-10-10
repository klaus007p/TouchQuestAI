import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { mutateQuest } from "@/engines/quest/mutate";
import { toApiQuest,  toGeneratedQuest } from "@/lib/quest-mapper";
import { MutateQuestRequestSchema } from "@/types/quest";
import { error } from "console";



export async function POST (
    request: Request,
    { params }: { params: Promise<{ id: string}> }
) {
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const parsed = MutateQuestRequestSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const user = await getCurrentUser();

    const original = await prisma.quest.findUnique({ where: { id } });
    if (!original || original.createdById !== user.id) {
        return NextResponse.json({ error: "Quest not found" }, { status: 404 });

    }

    const { quest, source } = await mutateQuest(
        toGeneratedQuest(original),
        parsed.data.reason
    );

    const saved = await prisma.quest.create({
        data: {
            ...quest,
            steps: JSON.stringify(quest.steps),
            userIntent: original.userIntent,
            createdById: user.id,
            parentQuestId: original.id,
            mutationReason: parsed.data.reason,
        },
    });

    return NextResponse.json({ source, quest: toApiQuest(saved) });
}