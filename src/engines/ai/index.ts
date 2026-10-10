import type { AIProvider } from "./types";
import { OllamaProvider } from "./providers/ollama";
import { defineConfig } from "prisma/config";


export function getAIProvider(): AIProvider {
    const provider = process.env.AI_PROVIDER ?? "ollama";

    switch(provider) {
        case "ollama":
            return new OllamaProvider();
        default:
            throw new Error (`Unknown AI_Provider: ${provider}`);
    }
}