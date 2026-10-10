import { NextResponse } from "next/server";
import { getAIProvider } from "@/engines/ai";


export async function GET() {
    try {
        const ai = getAIProvider();
        const text = await ai.complete({
            system: "You can reply only with valid JSON.",
            prompt: 'Return this JSON: {"Hello":"World"}',
        });

        return NextResponse.json({ provider: ai.name, text });

    } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}