
import type { AIProvider } from "./types";
import { OllamaProvider } from "./providers/ollama";
import { OpenRouterProvider } from "./providers/openrouter";

export function getAIProvider(): AIProvider {
    const provider = (
        process.env.AI_PROVIDER ?? "ollama"
    ).toLowerCase();

    switch (provider) {
        case "ollama":
            return new OllamaProvider();

        case "openrouter":
            return new OpenRouterProvider();

        default:
            throw new Error(`Unknown AI_PROVIDER: ${provider}`);
    }
}
