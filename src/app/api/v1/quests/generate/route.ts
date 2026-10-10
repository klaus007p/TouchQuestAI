import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { generateQuest } from "@/engines/quest/generate";
import { GenerateQuestRequestSchema } from "@/types/quest";


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
    const { quest, source } = await generateQuest(parsed.data);

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
        quest: { ...saved, steps: quest.steps },
    });
}