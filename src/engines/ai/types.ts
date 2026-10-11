
export interface AICompletionInput {
    system: string;
    prompt: string;
    timeoutMs?: number;

}


export interface AIProvider {
    name: string;
    complete(input: AICompletionInput): Promise<string>;
    
}