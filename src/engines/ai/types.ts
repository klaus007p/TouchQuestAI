
export interface AICompletionInput {
    system: string;
    prompt: string;

}


export interface AIProvider {
    name: string;
    complete(input: AICompletionInput): Promise<string>;
    
}