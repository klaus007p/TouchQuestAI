import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";


export async function GET() {
    const user = await getCurrentUser();

    const [totals, recent] = await Promise.all([
        prisma.xpEvent.aggregate({
            where: { userId: user.id },
            _sum: { xp: true, coins: true },
            _count: true,
        }),
        prisma.xpEvent.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: { quest: { select: { title: true } } },
        }),
    ]);

    return NextResponse.json({
        totalXp: totals._sum.xp ?? 0,
        totalCoins: totals._sum.coins ?? 0,
        eventCount: totals._count,
        recent: recent.map((e) => ({
            id: e.id,
            xp: e.xp,
            coins: e.coins,
            questTitle: e.quest.title,
            createdAt: e.createdAt,
        })),
    });
}