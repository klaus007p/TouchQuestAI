import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const GUEST_COOKIE = "tq_guest";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getCurrentUser() {
    const jar = await cookies();
    const id = jar.get(GUEST_COOKIE)?.value;

    if (id) {
        const existing = await prisma.user.findUnique({ where: { id } });
        if (existing) return existing;
    }

    const user = await prisma.user.create({
        data: { username: null, stats: { create: {} } },
    });

    jar.set(GUEST_COOKIE, user.id, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: ONE_YEAR,
        path: "/",
    });

    return user;
}