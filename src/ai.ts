import type Groq from "groq-sdk";

export interface Message {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    tool_call_id?: string;
    name?: string;
}

export interface UserMessage {
    type: "user_message";
    content: string;
    env_info: any;
    user_info: any;
}

export interface ToolCallResponse {
    function: string;
    response: any;
}

export interface FollowUpMessage {
    type: "follow_up";
    responses: ToolCallResponse[];
}

export interface ExecutionResult {
    response: string;
    messages: Message[];
}

export interface Tool {
    type: "function";
    function: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, {
                type: string;
                description: string;
                enum?: string[];
            }>;
            required: string[];
        };
    };
}

export type Tools = Record<string, {
    function: ToolFunction;
    description: string;
    parameters: {
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
        }>;
        required: string[];
    };
}>;

export type ToolFunction = (args: any) => Promise<any>;

export class AIContextManager {
    private client: Groq;
    private baseMessages: Message[];
    private tools: Tool[];
    private toolFunctions: Record<string, ToolFunction>;
    private model: string;

    constructor(
        client: Groq,
        tools: Record<string, {
            function: ToolFunction;
            description: string;
            parameters: {
                properties: Record<string, {
                    type: string;
                    description: string;
                    enum?: string[];
                }>;
                required: string[];
            };
        }>,
        model = "llama3-groq-70b-8192-tool-use-preview"
    ) {
        this.client = client;
        this.model = model;
        this.baseMessages = [];
        this.toolFunctions = {};
        this.tools = [];
        
        // Convert provided tools into GROQ API format
        this.tools = Object.entries(tools).map(([name, config]) => ({
            type: "function",
            function: {
                name,
                description: config.description,
                parameters: {
                    type: "object",
                    properties: config.parameters.properties,
                    required: config.parameters.required
                }
            }
        }));
        
        // Store tool functions separately
        Object.entries(tools).forEach(([name, config]) => {
            this.toolFunctions[name] = config.function;
        });
    }

    async initialize(systemPrompt: string, messages: Message[] = []): Promise<void> {
        this.baseMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];
    }

    private async executeFunctionCalls(toolCalls: any[]): Promise<ToolCallResponse[]> {
        return await Promise.all(toolCalls.map(async (call) => {
            const functionName = call.function.name;
            
            if (!(functionName in this.toolFunctions)) {
                throw new Error(`Unknown function: ${functionName}`);
            }
            
            console.log(`[TOOLS] Executing ${functionName}:`, call.function.arguments);
            
            try {
                const args = JSON.parse(call.function.arguments);
                const response = await this.toolFunctions[functionName](args);
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

    async execute(request: UserMessage | FollowUpMessage, messageCallback?: (message: Message) => void,context?: Message[]): Promise<ExecutionResult> {
        const messages = context || this.baseMessages;
        
        console.log(`[USER] Executing:`, request);
        
        // Prepare chat request
        const chatRequest = {
            model: this.model,
            messages: [
                ...messages,
                { role: 'user', content: JSON.stringify(request) }
            ],
            tools: this.tools,
            tool_choice: "auto",
            temperature: 0,
            max_tokens: 4096
        };

        // Get AI response
        const completion = await this.client.chat.completions.create(chatRequest as unknown as any);
        const responseMessage = completion.choices[0].message;

        // Check for tool calls
        if (responseMessage.tool_calls) {
            console.log("[AI] Tool calls detected");
            
            // Add the assistant's response to messages
            messages.push(responseMessage as Message);
            if (messageCallback) messageCallback(responseMessage as Message)
            
            // Execute all tool calls
            const functionResponses = await this.executeFunctionCalls(responseMessage.tool_calls);
            
            // Add tool responses to messages
            responseMessage.tool_calls.forEach((toolCall: any, index: number) => {
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: toolCall.function.name,
                    content: JSON.stringify(functionResponses[index].response)
                });
            });
            
            // Make second request with tool results
            const secondResponse = await this.client.chat.completions.create({
                model: this.model,
                messages: messages as any[]
            });
            if (messageCallback) messageCallback({role: "assistant", content: secondResponse.choices[0].message.content!})
            
            return {
                response: secondResponse.choices[0].message.content!,
                messages: messages
            };
        }

        // Direct response without tool use
        if (messageCallback) messageCallback(responseMessage as Message)

        return {
            response: responseMessage.content!,
            messages: [...messages, responseMessage as Message]
        };
    }
}
