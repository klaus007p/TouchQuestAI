import { NextResponse } from "next/server";
import type { UserPreference } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { UpdatePreferencesSchema } from "@/types/preferences";




function parseList(value: string | null): string[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function toApi(pref: UserPreference | null) {
    return {
        interests: parseList(pref?.interests ?? null),
        difficulty: pref?.difficulty ?? null,
        goals: pref?.goals ?? null,
    };
}


export async function GET() {
    const user = await getCurrentUser();
    const pref = await prisma.userPreference.findUnique({
        where: { userId: user.id },
    });
    return NextResponse.json({ preferences: toApi(pref) });
}


export async function PATCH(request: Request) {
    const body = await request.json().catch(() => null);
    const parsed = UpdatePreferencesSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid request", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const user = await getCurrentUser();
    const d = parsed.data;

    const data: {
        interests?: string | null;
        difficulty?: string | null;
        goals?: string | null;
    } = {};
    if (d.interests !== undefined) data.interests = JSON.stringify(d.interests);
    if (d.difficulty !== undefined) data.difficulty = d.difficulty;
    if (d.goals !== undefined) data.goals = d.goals;

    const pref = await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: data,
        create: { userId: user.id, ...data },
    });
    
    return NextResponse.json({ preferences: toApi(pref) });
}