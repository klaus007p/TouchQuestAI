import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";


export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = await getCurrentUser();

    const quest = await prisma.quest.findUnique({ where: { id } });
    if (!quest || quest.createdById !== user.id) {
        return NextResponse.json({ error: "Quest not found " }, { status: 404 });
    }

    const existing = await prisma.questAttempt.findFirst({
        where: { userId: user.id, questId: id, status: "started" },
    });

    if(existing){
        return NextResponse.json({ attempt: existing, resumed: true });
    }

    const attempt = await prisma.questAttempt.create({
        data: { userId: user.id, questId: id },
    });

    return NextResponse.json({ attempt, resumed: false }, { status: 201});
}