
import type { AICompletionInput, AIProvider } from "../types";

export class OpenRouterProvider implements AIProvider {
    name = "openrouter";

    private apiKey = process.env.OPENROUTER_API_KEY;
    private model = process.env.OPENROUTER_MODEL ?? "openrouter/free";

    async complete({
        system,
        prompt,
        timeoutMs,
    }: AICompletionInput): Promise<string> {
        if (!this.apiKey) {
            throw new Error("OPENROUTER_API_KEY is not configured");
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",
                signal: AbortSignal.timeout(timeoutMs ?? 60_000),
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                    "X-Title": "TouchQuestAI",
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: "system", content: system },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.8,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(
                `OpenRouter API Error ${response.status}: ${await response.text()}`
            );
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (typeof content !== "string" || !content.trim()) {
            throw new Error("OpenRouter returned an empty response");
        }

        return content;
    }
}
