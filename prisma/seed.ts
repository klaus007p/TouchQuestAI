import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();


async function main() {
    const user = await prisma.user.upsert({
        where: { email: "test@touchquest.dev" },
        update: {},
        create: {
            username: "testuser",
            email: "test@touchquest.dev",
            passwordHash: "placeholder-not-a-real-hash",
            stats: { create: {} },
        },
    });

    console.log("Seeded test user: ", user.id);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);

}).finally(async () => {
    await prisma.$disconnect();
});