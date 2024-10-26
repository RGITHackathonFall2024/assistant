import type { ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions.mjs';
import { promises as fs } from 'fs';
import type Groq from 'groq-sdk';

export interface UserMessage {
    type: "user_message";
    content: string;
    env_info: any;
    user_info: any;
}

export interface FollowUpMessage {
    type: "follow_up";
    responses: Array<{
        function: string;
        response: any;
    }>;
}

export interface ExecutionResult {
    response: string;
    messages: ChatCompletionMessageParam[];
}

export interface FunctionCall {
    namespace: string;
    name: string;
    args: any;
}

export interface AIResponse {
    response: string;
    follow_up: boolean;
    function_calls?: FunctionCall[];
}

export class AIContextManager {
    private schema: string;
    private baseMessages: ChatCompletionMessageParam[];
    private tools: Record<string, {handler: (args: any) => Promise<any>}>;
    private model: string;
    private client: Groq;

    constructor(client: Groq, tools: Record<string, {handler: (args: any) => Promise<any>}>, model = "llama3-70b-8192") {
        this.tools = tools;
        this.model = model;
        this.baseMessages = [];
        this.schema = "";
        this.client = client;
    }

    async initialize(messages: ChatCompletionMessageParam[]): Promise<void> {
        // Load schema and configuration files
        this.schema = await fs.readFile("assistant-schema.json", "utf-8");
        const config = await fs.readFile("assistant-config.md", "utf-8");
        
        this.baseMessages = [
            { role: 'system', content: config },
            { 
                role: 'system', 
                content: `Ты ассистент который отвечает только в JSON\nJSON должен быть следущей схемы: ${this.schema}`
            },
            ...messages
        ];
    }

    private createChatRequest(messages: ChatCompletionMessageParam[]): ChatCompletionCreateParamsNonStreaming {
        return {
            messages,
            model: this.model,
            temperature: 0,
            max_tokens: 8000,
            top_p: 1,
            stream: false,
            response_format: {
                type: "json_object"
            },
            stop: null
        };
    }

    private async executeFunctionCalls(functionCalls: FunctionCall[]): Promise<Array<{function: string, response: any}>> {
        return await Promise.all(functionCalls.map(async (call) => {
            const functionName = `${call.namespace}.${call.name}`;
            
            if (!(functionName in this.tools)) {
                throw new Error(`Unknown function: ${functionName}`);
            }
            
            console.log(`[TOOLS] Executing ${functionName}:`, call.args);
            
            try {
                const response = await this.tools[functionName].handler(call.args);
                return {
                    function: functionName,
                    response
                };
            } catch (error) {
                console.error(`[ERROR] Failed to execute ${functionName}:`, error);
                throw error;
            }
        }));
    }

    async execute(request: UserMessage | FollowUpMessage, messageCallback: (message: ChatCompletionMessageParam) => void = () => {}, context?: ChatCompletionMessageParam[]): Promise<ExecutionResult> {
        const messages = context || this.baseMessages;
        
        console.log(`[USER] Executing:`, request);
        
        // Prepare chat request
        const chatRequest = this.createChatRequest([
            ...messages,
            { role: 'user', content: JSON.stringify(request) }
        ]);

        // Get AI response
        const completion = await this.client.chat.completions.create(chatRequest);
        const aiResponse: AIResponse = JSON.parse(completion.choices[0].message.content!);

        if (messageCallback) messageCallback(completion.choices[0].message);
        // Handle direct response
        if (!aiResponse.follow_up) {
            console.log(`[AI] Direct response:`, aiResponse.response);
            return {
                response: aiResponse.response,
                messages: [...chatRequest.messages, {
                    role: "assistant",
                    content: JSON.stringify(aiResponse)
                }]
            };
        }

        // Handle follow-up with function calls
        console.log("[AI] Follow-up with function calls");
        const functionResponses = await this.executeFunctionCalls(aiResponse.function_calls!);
        
        // Recursive call with function responses
        return this.execute({
            type: "follow_up",
            responses: functionResponses
        }, messageCallback, chatRequest.messages);
    }
}