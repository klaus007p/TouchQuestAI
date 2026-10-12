import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";


export async function GET() {
    
    const user = await getCurrentUser();
    return NextResponse.json({
        id: user.id,
        username: user.username ?? "guest",
        isGuest: !user.email,
    });
}