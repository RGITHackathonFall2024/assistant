import Groq from 'groq-sdk';
import "dotenv/config";
import fs from "fs/promises";
import type { ChatCompletionCreateParamsNonStreaming } from 'groq-sdk/resources/chat/completions.mjs';
import { generateMockTickets } from './mock';
import type { FollowUpMessage } from './gen';
import { AIContextManager, type Message, type ToolFunction, type UserMessage } from './ai';

const client = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});

let tools: Record<string, {
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
}> = {
    "rzd.getTicketPrices": {
        function: async (data: any) => {
            let query: { from: string, to: string, from_date: string, to_date: string | undefined} = data;
            console.log("[TOOLS] AI tried to search tickets from", query.from, "to", query.to, "on date from", query.from_date, query.to_date ? `to date ${query.to_date}` : '');
            return generateMockTickets(query.from, query.to, 2, 5)
        },
        description: "Получает информацию о доступных билетах на поезд",
        parameters: {
            properties: {
                from: {
                    type: "string",
                    description: "Место отправления (город или станция)",
                },
                to: {
                    type: "string",
                    description: "Место прибытия (город или станция)",
                },

                from_date: {
                    type: "string",
                    description: "Начальная дата"
                },
                to_date: {
                    type: "string",
                    description: "Конечная дата",
                }
            },
            required: ["from", "to", "from_date"]
        }

    }
}

async function main(request: UserMessage | FollowUpMessage) {
    const ai = new AIContextManager(client, tools, "llama3-70b-8192");

    await ai.initialize(await fs.readFile("assistant-config.md", "utf-8"));
    await ai.execute(request, (message: Message) => {
        console.log(`[APP] got ${message.role} message, ${message.content}`);
    });
}

main({
    type: "user_message",
    content: "Хочу билеты в питер на послезавтра",
    env_info: {
        current_date: new Date().toLocaleDateString("ru")
    },
    user_info: {
        name: "Дмитрий",
        location: "Ростов-на-Дону, Ростовская Область, Россия"
    }
});