
import type { AICompletionInput, AIProvider } from "../types";


export class OllamaProvider implements AIProvider {

    name = "ollama";

    private baseUrl = process.env.OLLAMA_URL ?? "http://localhost:11434";
    private model = process.env.OLLAMA_MODEL ?? "llama3.2";


    async complete({ system, prompt }: AICompletionInput): Promise<string> {
        const res = await fetch(`${this.baseUrl}/api/chat`, {
            method: "POST",
            signal: AbortSignal.timeout(60_000),
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: this.model,
                stream: false,
                keep_alive: "30m",
                format: "json",
                options: { temperature: 0.8 },
                messages: [
                    { role: "system", content: system },
                    { role: "user", content: prompt },
                ],
            }),
        });


        if (!res.ok) {
            throw new Error(`Ollama Error ${res.status}: ${await res.text()}`);

        }

        const data = await res.json();
        return data.message.content as string;
    }
}