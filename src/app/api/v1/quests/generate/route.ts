import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { generateQuest } from "@/engines/quest/generate";
import { GenerateQuestRequestSchema } from "@/types/quest";
import { toApiQuest } from "@/lib/quest-mapper";
import { buildUserContext } from "@/engines/quest/context";



export async function POST(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = GenerateQuestRequestSchema.safeParse(body);

    if(!parsed.success){
        return NextResponse.json(
            { error: "Invalid request", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const user = await getCurrentUser();
    const ctx = await buildUserContext(user.id);
    const { quest, source } = await generateQuest(parsed.data, ctx);

    const saved = await prisma.quest.create({
        data: {
            ...quest,
            steps: JSON.stringify(quest.steps),
            userIntent: parsed.data.intent,
            createdById: user.id,
        },
    });

    return NextResponse.json({
        source,
        quest: toApiQuest(saved)
    });
}