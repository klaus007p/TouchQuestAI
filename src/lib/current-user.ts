import { prisma } from "@/lib/prisma";


// User helper until auth

export async function getCurrentUser() {
    const user = await prisma.user.findUnique({
        where: { email: "test@touchquest.dev" },
    });

    if(!user) {
        throw new Error("Test user missing: Run : npx prisma db seed ");
    }

    return user;
}